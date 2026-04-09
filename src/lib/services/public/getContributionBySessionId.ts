import "server-only";

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

  return data ? mapContribution(data) : null;
}
