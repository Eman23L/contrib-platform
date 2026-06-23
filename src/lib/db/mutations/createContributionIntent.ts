import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContributionIntent } from "@/types/domain";

type CreateContributionIntentInput = {
  organisationId: string;
  fundId: string;
  amountMinor: number;
  currencyCode: string;
  guestEmail?: string;
  userId?: string;
};

type UpdateContributionIntentCheckoutInput = {
  intentId: string;
  stripeCheckoutSessionId: string;
  checkoutUrl: string;
  expiresAt: string | null;
};

type ContributionIntentRow = {
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
};

function mapContributionIntent(row: ContributionIntentRow): ContributionIntent {
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
  };
}

const contributionIntentSelect = [
  "id",
  "organisation_id",
  "fund_id",
  "campaign_id",
  "user_id",
  "amount_minor",
  "currency_code",
  "status",
  "payment_provider",
  "guest_email",
  "donor_name",
  "donor_note",
  "is_anonymous",
  "source",
  "stripe_checkout_session_id",
  "checkout_url",
  "expires_at",
  "paid_at",
  "created_at",
  "updated_at",
].join(", ");

export async function createContributionIntent(
  supabase: SupabaseClient,
  input: CreateContributionIntentInput,
): Promise<ContributionIntent> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .insert({
      organisation_id: input.organisationId,
      fund_id: input.fundId,
      user_id: input.userId ?? null,
      amount_minor: input.amountMinor,
      currency_code: input.currencyCode,
      guest_email: input.guestEmail ?? null,
      payment_provider: "stripe",
      status: "draft",
      source: "qr",
    })
    .select(contributionIntentSelect)
    .single<ContributionIntentRow>();

  if (error) {
    throw new Error(`Failed to create contribution intent: ${error.message}`);
  }

  return mapContributionIntent(data);
}

export async function updateContributionIntentCheckout(
  supabase: SupabaseClient,
  input: UpdateContributionIntentCheckoutInput,
): Promise<ContributionIntent> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .update({
      status: "checkout_created",
      stripe_checkout_session_id: input.stripeCheckoutSessionId,
      checkout_url: input.checkoutUrl,
      expires_at: input.expiresAt,
    })
    .eq("id", input.intentId)
    .select(contributionIntentSelect)
    .single<ContributionIntentRow>();

  if (error) {
    throw new Error(
      `Failed to update contribution intent checkout session: ${error.message}`,
    );
  }

  return mapContributionIntent(data);
}
