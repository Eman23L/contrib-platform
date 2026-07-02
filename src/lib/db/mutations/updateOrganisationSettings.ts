import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ValidatedOrganisationSettings } from "@/lib/validators/organisationSettings";

type UpdateOrganisationSettingsInput = ValidatedOrganisationSettings & {
  organisationId: string;
  settings: Record<string, unknown>;
};

type UpdatedOrganisationRow = {
  id: string;
  slug: string;
};

export async function updateOrganisationSettings(
  supabase: SupabaseClient,
  input: UpdateOrganisationSettingsInput,
) {
  const { data, error } = await supabase
    .from("organisations")
    .update({
      legal_name: input.legalName,
      name: input.name,
      settings: input.settings,
      slug: input.slug,
      timezone: input.timezone,
    })
    .eq("id", input.organisationId)
    .select("id, slug")
    .single<UpdatedOrganisationRow>();

  if (error) {
    throw new Error(`Failed to update organisation settings: ${error.message}`);
  }

  return data;
}
