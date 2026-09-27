import type { SupabaseClient } from "@supabase/supabase-js";

import type { Organisation } from "@/types/domain";

type OrganisationRow = {
  id: string;
  name: string;
  slug: string;
  legal_name: string | null;
  currency_code: string;
  timezone: string;
  settings: Record<string, unknown> | null;
};

function mapOrganisation(row: OrganisationRow): Organisation {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    legalName: row.legal_name,
    currencyCode: row.currency_code,
    timezone: row.timezone,
    settings: row.settings ?? {},
  };
}

export async function getOrganisationBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<Organisation | null> {
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug, legal_name, currency_code, timezone, settings")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle<OrganisationRow>();

  if (error) {
    throw new Error(`Failed to load organisation: ${error.message}`);
  }

  return data ? mapOrganisation(data) : null;
}

// Used to guess which organisation a signed-in supporter belongs to when
// there is no explicit org context (no ?org= param, no giving history yet)
// and no DEFAULT_ORGANISATION_SLUG is configured. Deliberately only resolves
// when exactly one active organisation exists, so a real multi-tenant
// deployment with more than one organisation is left to rely on explicit
// org context rather than guessing wrong.
export async function getSoleActiveOrganisation(
  supabase: SupabaseClient,
): Promise<Organisation | null> {
  const { data, error } = await supabase
    .from("organisations")
    .select("id, name, slug, legal_name, currency_code, timezone, settings")
    .eq("is_active", true)
    .limit(2);

  if (error) {
    throw new Error(`Failed to load organisations: ${error.message}`);
  }

  return data && data.length === 1
    ? mapOrganisation(data[0] as OrganisationRow)
    : null;
}
