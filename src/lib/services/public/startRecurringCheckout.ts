import { getActiveFundForOrganisation } from "@/lib/db/queries/funds";
import { getOrganisationBySlug } from "@/lib/db/queries/organisations";
import { getStripeServerClient } from "@/lib/stripe/server";
import {
  createServerSupabaseServiceClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";
import { validateContributionIntentPayload } from "@/lib/validators/contributionIntent";
import type { CreateContributionIntentRequest } from "@/types/api";

export async function startRecurringCheckout(
  payload: CreateContributionIntentRequest,
  siteUrl: string,
) {
  const authenticatedUser = await getAuthenticatedServerUser();

  if (!authenticatedUser) {
    throw new Error("Sign in to set up a monthly gift.");
  }

  const validated = validateContributionIntentPayload(
    payload,
    authenticatedUser.user.email,
  );
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

  const metadata = {
    organisation_id: organisation.id,
    fund_id: fund.id,
    user_id: authenticatedUser.user.id,
    donor_name: validated.donorName ?? "",
    org_slug: organisation.slug,
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${siteUrl}/o/${organisation.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/o/${organisation.slug}/failed`,
    customer_email: validated.guestEmail,
    metadata,
    subscription_data: {
      metadata,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: validated.amountMinor,
          recurring: {
            interval: "month",
          },
          product_data: {
            name: `${fund.name} (monthly)`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    throw new Error("Stripe Checkout session did not return a redirect URL.");
  }

  return {
    ok: true as const,
    checkoutUrl: session.url,
    message: "Monthly gift checkout created",
  };
}
