import { getOrganisationBySlug } from "@/lib/db/queries/organisations";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";

export async function getPublicOrganisation(orgSlug: string) {
  const supabase = createServerSupabaseServiceClient();

  return getOrganisationBySlug(supabase, orgSlug);
}
