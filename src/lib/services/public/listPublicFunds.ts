import { listActiveFundsByOrganisationId } from "@/lib/db/queries/funds";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";

export async function listPublicFunds(organisationId: string) {
  const supabase = createServerSupabaseServiceClient();

  return listActiveFundsByOrganisationId(supabase, organisationId);
}
