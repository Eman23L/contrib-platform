import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrganisationMembership } from "@/types/domain";

type MembershipRow = {
  id: string;
  organisation_id: string;
  user_id: string;
  role: OrganisationMembership["role"];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organisations: {
    name: string;
    slug: string;
  } | null;
};

function mapMembership(row: MembershipRow): OrganisationMembership {
  return {
    id: row.id,
    organisationId: row.organisation_id,
    userId: row.user_id,
    role: row.role,
    isActive: row.is_active,
    organisationName: row.organisations?.name ?? "Unknown organisation",
    organisationSlug: row.organisations?.slug ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listAdminMembershipsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<OrganisationMembership[]> {
  const { data, error } = await supabase
    .from("organisation_memberships")
    .select(
      `
        id,
        organisation_id,
        user_id,
        role,
        is_active,
        created_at,
        updated_at,
        organisations:organisations!inner (
          name,
          slug
        )
      `,
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .in("role", ["owner", "admin", "finance"])
    .order("created_at", { ascending: true })
    .returns<MembershipRow[]>();

  if (error) {
    throw new Error(`Failed to load organisation memberships: ${error.message}`);
  }

  return data.map(mapMembership);
}
