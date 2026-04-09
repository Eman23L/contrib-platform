import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublicFund } from "@/types/domain";

type FundRow = {
  id: string;
  organisation_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  display_order: number;
};

function mapFund(row: FundRow): PublicFund {
  return {
    id: row.id,
    organisationId: row.organisation_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isDefault: row.is_default,
    displayOrder: row.display_order,
  };
}

export async function listActiveFundsByOrganisationId(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<PublicFund[]> {
  const { data, error } = await supabase
    .from("funds")
    .select(
      "id, organisation_id, name, slug, description, is_default, display_order",
    )
    .eq("organisation_id", organisationId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("display_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<FundRow[]>();

  if (error) {
    throw new Error(`Failed to load funds: ${error.message}`);
  }

  return data.map(mapFund);
}

export async function getActiveFundForOrganisation(
  supabase: SupabaseClient,
  organisationId: string,
  fundId: string,
): Promise<PublicFund | null> {
  const { data, error } = await supabase
    .from("funds")
    .select(
      "id, organisation_id, name, slug, description, is_default, display_order",
    )
    .eq("organisation_id", organisationId)
    .eq("id", fundId)
    .eq("is_active", true)
    .maybeSingle<FundRow>();

  if (error) {
    throw new Error(`Failed to load fund: ${error.message}`);
  }

  return data ? mapFund(data) : null;
}
