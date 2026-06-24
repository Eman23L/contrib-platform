import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContributionIntent, Organisation } from "@/types/domain";

export type AdminOrganisation = Pick<
  Organisation,
  "id" | "name" | "slug" | "currencyCode"
>;

type AdminOrganisationRow = {
  id: string;
  name: string;
  slug: string;
  currency_code: string;
};

export type AdminSummaryRow = {
  amount_minor: number;
  guest_email: string | null;
  status: ContributionIntent["status"];
};

export type AdminRecentContributionRow = {
  id: string;
  created_at: string;
  amount_minor: number;
  status: ContributionIntent["status"];
  guest_email: string | null;
  donor_name: string | null;
  organisations: {
    name: string;
  } | null;
  funds: {
    name: string;
  } | null;
};

export type AdminFundTotalsRow = {
  fund_id: string | null;
  amount_minor: number;
  status: ContributionIntent["status"];
  funds: {
    name: string;
  } | null;
};

export type AdminStatusTotalsRow = {
  amount_minor: number;
  status: ContributionIntent["status"];
};

function mapAdminOrganisation(row: AdminOrganisationRow): AdminOrganisation {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    currencyCode: row.currency_code,
  };
}

export async function getAdminOrganisationBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<AdminOrganisation | null> {
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug, currency_code")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<AdminOrganisationRow>();

  if (error) {
    throw new Error(`Failed to load admin organisation: ${error.message}`);
  }

  return data ? mapAdminOrganisation(data) : null;
}

export async function listAdminSummaryRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminSummaryRow[]> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .select("amount_minor, guest_email, status")
    .eq("organisation_id", organisationId)
    .returns<AdminSummaryRow[]>();

  if (error) {
    throw new Error(`Failed to load admin summary rows: ${error.message}`);
  }

  return data;
}

export async function listAdminRecentContributionRows(
  supabase: SupabaseClient,
  organisationId: string,
  limit = 10,
): Promise<AdminRecentContributionRow[]> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .select(
      `
        id,
        created_at,
        amount_minor,
        status,
        guest_email,
        donor_name,
        organisations:organisations!inner (
          name
        ),
        funds:funds (
          name
        )
      `,
    )
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<AdminRecentContributionRow[]>();

  if (error) {
    throw new Error(`Failed to load recent contributions: ${error.message}`);
  }

  return data;
}

export async function listAdminFundTotalsRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminFundTotalsRow[]> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .select(
      `
        fund_id,
        amount_minor,
        status,
        funds:funds (
          name
        )
      `,
    )
    .eq("organisation_id", organisationId)
    .returns<AdminFundTotalsRow[]>();

  if (error) {
    throw new Error(`Failed to load fund totals rows: ${error.message}`);
  }

  return data;
}

export async function listAdminStatusTotalsRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminStatusTotalsRow[]> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .select("amount_minor, status")
    .eq("organisation_id", organisationId)
    .returns<AdminStatusTotalsRow[]>();

  if (error) {
    throw new Error(`Failed to load status totals rows: ${error.message}`);
  }

  return data;
}
