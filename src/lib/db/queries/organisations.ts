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
