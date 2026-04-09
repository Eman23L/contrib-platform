import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContributionIntent } from "@/types/domain";

export type AdminContributionsFilters = {
  endDate?: string;
  fundId?: string;
  organisationId: string;
  startDate?: string;
  status?: ContributionIntent["status"];
};

export type AdminContributionRow = {
  id: string;
  created_at: string;
  amount_minor: number;
  currency_code: string;
  status: ContributionIntent["status"];
  guest_email: string | null;
  payment_provider: ContributionIntent["paymentProvider"];
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  organisations: {
    name: string;
    slug: string;
  } | null;
  funds: {
    name: string;
  } | null;
};

export type AdminContributionSummaryRow = Pick<
  AdminContributionRow,
  "amount_minor" | "status"
>;

export async function listAdminContributionRows(
  supabase: SupabaseClient,
  filters: AdminContributionsFilters,
): Promise<AdminContributionRow[]> {
  let query = supabase
    .from("contribution_intents")
    .select(
      `
        id,
        created_at,
        amount_minor,
        currency_code,
        status,
        guest_email,
        payment_provider,
        stripe_checkout_session_id,
        paid_at,
        organisations:organisations!inner (
          name,
          slug
        ),
        funds:funds (
          name
        )
      `,
    )
    .eq("organisation_id", filters.organisationId)
    .order("created_at", { ascending: false });

  if (filters.fundId) {
    query = query.eq("fund_id", filters.fundId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.startDate) {
    query = query.gte("created_at", `${filters.startDate}T00:00:00.000Z`);
  }

  if (filters.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59.999Z`);
  }

  const { data, error } = await query.returns<AdminContributionRow[]>();

  if (error) {
    throw new Error(`Failed to load admin contributions: ${error.message}`);
  }

  return data;
}

export async function listAdminContributionSummaryRows(
  supabase: SupabaseClient,
  filters: AdminContributionsFilters,
): Promise<AdminContributionSummaryRow[]> {
  let query = supabase
    .from("contribution_intents")
    .select("amount_minor, status")
    .eq("organisation_id", filters.organisationId);

  if (filters.fundId) {
    query = query.eq("fund_id", filters.fundId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.startDate) {
    query = query.gte("created_at", `${filters.startDate}T00:00:00.000Z`);
  }

  if (filters.endDate) {
    query = query.lte("created_at", `${filters.endDate}T23:59:59.999Z`);
  }

  const { data, error } = await query.returns<AdminContributionSummaryRow[]>();

  if (error) {
    throw new Error(
      `Failed to load admin contribution summary rows: ${error.message}`,
    );
  }

  return data;
}
