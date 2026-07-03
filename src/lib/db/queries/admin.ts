import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContributionIntent, Organisation } from "@/types/domain";

export type AdminOrganisation = Pick<
  Organisation,
  "currencyCode" | "id" | "legalName" | "name" | "settings" | "slug" | "timezone"
>;

type AdminOrganisationRow = {
  id: string;
  legal_name: string | null;
  name: string;
  slug: string;
  currency_code: string;
  settings: Record<string, unknown>;
  timezone: string;
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
  created_at: string;
  fund_id: string | null;
  amount_minor: number;
  status: ContributionIntent["status"];
  funds: {
    name: string;
  } | null;
};

export type AdminFundRow = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
};

export type AdminStatusTotalsRow = {
  amount_minor: number;
  status: ContributionIntent["status"];
};

export type AdminSectionContributionRow = {
  id: string;
  amount_minor: number;
  campaign_id: string | null;
  created_at: string;
  donor_name: string | null;
  guest_email: string | null;
  status: ContributionIntent["status"];
  funds: {
    name: string;
  } | null;
};

export type AdminCampaignRow = {
  id: string;
  description: string | null;
  ends_at: string | null;
  fund_id: string;
  goal_amount_minor: number | null;
  name: string;
  is_active: boolean;
  starts_at: string | null;
  funds: {
    name: string;
  } | null;
};

export type AdminTeamMemberRow = {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

function mapAdminOrganisation(row: AdminOrganisationRow): AdminOrganisation {
  return {
    currencyCode: row.currency_code,
    id: row.id,
    legalName: row.legal_name,
    name: row.name,
    settings: row.settings,
    slug: row.slug,
    timezone: row.timezone,
  };
}

export async function getAdminOrganisationBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<AdminOrganisation | null> {
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug, legal_name, currency_code, timezone, settings")
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
        created_at,
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

export async function listAdminFundRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminFundRow[]> {
  const { data, error } = await supabase
    .from("funds")
    .select("id, name, description, is_active, is_default, display_order")
    .eq("organisation_id", organisationId)
    .order("is_default", { ascending: false })
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<AdminFundRow[]>();

  if (error) {
    throw new Error(`Failed to load admin fund rows: ${error.message}`);
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

export async function listAdminSectionContributionRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminSectionContributionRow[]> {
  const { data, error } = await supabase
    .from("contribution_intents")
    .select(
      `
        id,
        amount_minor,
        campaign_id,
        created_at,
        donor_name,
        guest_email,
        status,
        funds:funds (
          name
        )
      `,
    )
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: false })
    .returns<AdminSectionContributionRow[]>();

  if (error) {
    throw new Error(`Failed to load section contribution rows: ${error.message}`);
  }

  return data;
}

export async function listAdminCampaignRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminCampaignRow[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
        id,
        description,
        ends_at,
        fund_id,
        goal_amount_minor,
        name,
        is_active,
        starts_at,
        funds:funds (
          name
        )
      `,
    )
    .eq("organisation_id", organisationId)
    .order("name", { ascending: true })
    .returns<AdminCampaignRow[]>();

  if (error) {
    throw new Error(`Failed to load campaign rows: ${error.message}`);
  }

  return data;
}

export async function listAdminTeamMemberRows(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<AdminTeamMemberRow[]> {
  const { data, error } = await supabase
    .from("organisation_memberships")
    .select("id, user_id, role, is_active, created_at")
    .eq("organisation_id", organisationId)
    .order("created_at", { ascending: true })
    .returns<AdminTeamMemberRow[]>();

  if (error) {
    throw new Error(`Failed to load team member rows: ${error.message}`);
  }

  return data;
}
