import {
  createContributionIntent,
  updateContributionIntentCheckout,
} from "@/lib/db/mutations/createContributionIntent";
import { getActiveFundForOrganisation } from "@/lib/db/queries/funds";
import { getOrganisationBySlug } from "@/lib/db/queries/organisations";
import { getStripeServerClient } from "@/lib/stripe/server";
import {
  createServerSupabaseServiceClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";
import { validateContributionIntentPayload } from "@/lib/validators/contributionIntent";
import type { CreateContributionIntentRequest } from "@/types/api";

export async function startContributionCheckout(
  payload: CreateContributionIntentRequest,
  siteUrl: string,
) {
  const validated = validateContributionIntentPayload(payload);
  const supabase = createServerSupabaseServiceClient();
  const stripe = getStripeServerClient();

  const organisation = await getOrganisationBySlug(
    supabase,
    validated.organisationSlug,
  );

  if (!organisation) {
    throw new Error("Organisation not found.");
  }

  const fund = await getActiveFundForOrganisation(
    supabase,
    organisation.id,
    validated.fundId,
  );

  if (!fund) {
    throw new Error("Selected fund was not found.");
  }

  if (organisation.currencyCode !== "GBP") {
    throw new Error("Stripe Checkout is currently configured only for GBP.");
  }

  const authenticatedUser = await getAuthenticatedServerUser();

  const intent = await createContributionIntent(supabase, {
    organisationId: organisation.id,
    fundId: fund.id,
    amountMinor: validated.amountMinor,
    currencyCode: organisation.currencyCode,
    donorName: validated.donorName,
    guestEmail: validated.guestEmail,
    userId: authenticatedUser?.user.id,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/o/${organisation.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/o/${organisation.slug}/failed`,
    customer_email: validated.guestEmail,
    metadata: {
      intent_id: intent.id,
      organisation_id: organisation.id,
      fund_id: fund.id,
      donor_name: validated.donorName ?? "",
      org_slug: organisation.slug,
    },
    payment_intent_data: {
      metadata: {
        intent_id: intent.id,
        organisation_id: organisation.id,
        fund_id: fund.id,
        donor_name: validated.donorName ?? "",
        org_slug: organisation.slug,
      },
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: validated.amountMinor,
          product_data: {
            name: fund.name,
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session did not return a redirect URL.");
  }

  const updatedIntent = await updateContributionIntentCheckout(supabase, {
    intentId: intent.id,
    stripeCheckoutSessionId: session.id,
    checkoutUrl: session.url,
    expiresAt: session.expires_at
      ? new Date(session.expires_at * 1000).toISOString()
      : null,
  });

  return {
    ok: true as const,
    intentId: updatedIntent.id,
    checkoutUrl: session.url,
    message: "Intent created",
  };
}
