import { createServerSupabaseServiceClient } from "@/lib/supabase/server";
import type { ContributionIntent } from "@/types/domain";

export type PublicContributionDetails = ContributionIntent & {
  organisationName: string;
  organisationSlug: string;
  fundName: string | null;
};

type PublicContributionDetailsRow = {
  id: string;
  organisation_id: string;
  fund_id: string | null;
  campaign_id: string | null;
  user_id: string | null;
  amount_minor: number;
  currency_code: string;
  status: ContributionIntent["status"];
  payment_provider: ContributionIntent["paymentProvider"];
  guest_email: string | null;
  donor_name: string | null;
  donor_note: string | null;
  is_anonymous: boolean;
  source: ContributionIntent["source"];
  stripe_checkout_session_id: string | null;
  checkout_url: string | null;
  expires_at: string | null;
  paid_at: string | null;
  recurring_plan_id: string | null;
  created_at: string;
  updated_at: string;
  organisations: {
    name: string;
    slug: string;
  } | null;
  funds: {
    name: string;
  } | null;
};

function mapContribution(row: PublicContributionDetailsRow): PublicContributionDetails {
  return {
    id: row.id,
    organisationId: row.organisation_id,
    fundId: row.fund_id,
    campaignId: row.campaign_id,
    userId: row.user_id,
    amountMinor: row.amount_minor,
    currencyCode: row.currency_code,
    status: row.status,
    paymentProvider: row.payment_provider,
    guestEmail: row.guest_email,
    donorName: row.donor_name,
    donorNote: row.donor_note,
    isAnonymous: row.is_anonymous,
    source: row.source,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    checkoutUrl: row.checkout_url,
    expiresAt: row.expires_at,
    paidAt: row.paid_at,
    recurringPlanId: row.recurring_plan_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organisationName: row.organisations?.name ?? "",
    organisationSlug: row.organisations?.slug ?? "",
    fundName: row.funds?.name ?? null,
  };
}

const publicContributionSelect = `
  id,
  organisation_id,
  fund_id,
  campaign_id,
  user_id,
  amount_minor,
  currency_code,
  status,
  payment_provider,
  guest_email,
  donor_name,
  donor_note,
  is_anonymous,
  source,
  stripe_checkout_session_id,
  checkout_url,
  expires_at,
  paid_at,
  recurring_plan_id,
  created_at,
  updated_at,
  organisations:organisations!inner (
    name,
    slug
  ),
  funds:funds (
    name
  )
`;

type RecurringPlanBySessionRow = {
  id: string;
  organisation_id: string;
  fund_id: string | null;
  user_id: string;
  amount_minor: number;
  currency_code: string;
  donor_name: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
  organisations: {
    name: string;
    slug: string;
  } | null;
  funds: {
    name: string;
  } | null;
};

function mapRecurringPlanAsContribution(
  row: RecurringPlanBySessionRow,
): PublicContributionDetails {
  return {
    id: row.id,
    organisationId: row.organisation_id,
    fundId: row.fund_id,
    campaignId: null,
    userId: row.user_id,
    amountMinor: row.amount_minor,
    currencyCode: row.currency_code,
    status: "succeeded",
    paymentProvider: "stripe",
    guestEmail: null,
    donorName: row.donor_name,
    donorNote: null,
    isAnonymous: false,
    source: "recurring",
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    checkoutUrl: null,
    expiresAt: null,
    paidAt: row.created_at,
    recurringPlanId: row.id,
    createdAt: row.created_at,
    updatedAt: row.created_at,
    organisationName: row.organisations?.name ?? "",
    organisationSlug: row.organisations?.slug ?? "",
    fundName: row.funds?.name ?? null,
  };
}

async function getRecurringPlanBySessionId(
  sessionId: string,
): Promise<PublicContributionDetails | null> {
  const supabase = createServerSupabaseServiceClient();
  const { data, error } = await supabase
    .from("recurring_plans")
    .select(
      `
        id,
        organisation_id,
        fund_id,
        user_id,
        amount_minor,
        currency_code,
        donor_name,
        stripe_checkout_session_id,
        created_at,
        organisations:organisations!inner (
          name,
          slug
        ),
        funds:funds (
          name
        )
      `,
    )
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle<RecurringPlanBySessionRow>();

  if (error) {
    throw new Error(`Failed to load recurring plan: ${error.message}`);
  }

  return data ? mapRecurringPlanAsContribution(data) : null;
}

export async function getContributionBySessionId(
  stripeCheckoutSessionId: string,
): Promise<PublicContributionDetails | null> {
  const sessionId = stripeCheckoutSessionId.trim();

  if (!sessionId) {
    return null;
  }

  const supabase = createServerSupabaseServiceClient();
  const { data, error } = await supabase
    .from("contribution_intents")
    .select(publicContributionSelect)
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle<PublicContributionDetailsRow>();

  if (error) {
    throw new Error(`Failed to load contribution intent: ${error.message}`);
  }

  if (data) {
    return mapContribution(data);
  }

  // A monthly gift's checkout session never creates a contribution_intents
  // row directly (that row is created per billing cycle from
  // invoice.payment_succeeded); the recurring plan itself, created from
  // checkout.session.completed, is the record to show on the success page.
  return getRecurringPlanBySessionId(sessionId);
}
