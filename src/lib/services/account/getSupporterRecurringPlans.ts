import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { RecurringPlan } from "@/types/domain";

type RecurringPlanRow = {
  id: string;
  organisation_id: string;
  fund_id: string | null;
  user_id: string;
  amount_minor: number;
  currency_code: string;
  interval: string;
  status: RecurringPlan["status"];
  donor_name: string | null;
  stripe_subscription_id: string;
  created_at: string;
  canceled_at: string | null;
  organisations: {
    name: string;
    slug: string;
  } | null;
  funds: {
    name: string;
  } | null;
};

export type SupporterRecurringPlan = RecurringPlan & {
  organisationName: string;
  organisationSlug: string;
  fundName: string | null;
};

function mapRecurringPlan(row: RecurringPlanRow): SupporterRecurringPlan {
  return {
    id: row.id,
    organisationId: row.organisation_id,
    fundId: row.fund_id,
    userId: row.user_id,
    amountMinor: row.amount_minor,
    currencyCode: row.currency_code,
    interval: "month",
    status: row.status,
    donorName: row.donor_name,
    stripeSubscriptionId: row.stripe_subscription_id,
    createdAt: row.created_at,
    canceledAt: row.canceled_at,
    organisationName: row.organisations?.name ?? "Unknown organisation",
    organisationSlug: row.organisations?.slug ?? "",
    fundName: row.funds?.name ?? null,
  };
}

export async function getSupporterRecurringPlans(
  supabase: SupabaseClient,
  userId: string,
): Promise<SupporterRecurringPlan[]> {
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
        interval,
        status,
        donor_name,
        stripe_subscription_id,
        created_at,
        canceled_at,
        organisations:organisations!inner (
          name,
          slug
        ),
        funds:funds (
          name
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<RecurringPlanRow[]>();

  if (error) {
    throw new Error(`Failed to load recurring plans: ${error.message}`);
  }

  return data.map(mapRecurringPlan);
}
