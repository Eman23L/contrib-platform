import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { findUserByEmail } from "@/lib/auth/adminAccess";
import {
  countActiveOwners,
  getMembershipById,
} from "@/lib/db/queries/memberships";
import type { AssignableTeamRole } from "@/lib/validators/team";

export class TeamMembershipError extends Error {}

export async function addOrUpdateTeamMembership(
  supabase: SupabaseClient,
  input: {
    email: string;
    organisationId: string;
    role: AssignableTeamRole;
  },
) {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new TeamMembershipError(
      "No account exists for this email yet. Ask them to sign in at least once (as a supporter or guest), then try adding them again.",
    );
  }

  const { data: existing, error: existingError } = await supabase
    .from("organisation_memberships")
    .select("id, role, is_active")
    .eq("organisation_id", input.organisationId)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string; role: string; is_active: boolean }>();

  if (existingError) {
    throw new TeamMembershipError("Could not check existing team membership.");
  }

  if (existing?.role === "owner") {
    throw new TeamMembershipError(
      "This person is already the organisation owner. Ownership isn't changed from this form.",
    );
  }

  const { error } = await supabase.from("organisation_memberships").upsert(
    {
      is_active: true,
      organisation_id: input.organisationId,
      role: input.role,
      user_id: user.id,
    },
    { onConflict: "organisation_id,user_id" },
  );

  if (error) {
    throw new TeamMembershipError("Could not add this team member. Please try again.");
  }
}

export async function setTeamMembershipActive(
  supabase: SupabaseClient,
  input: {
    isActive: boolean;
    membershipId: string;
    organisationId: string;
  },
) {
  const membership = await getMembershipById(
    supabase,
    input.organisationId,
    input.membershipId,
  );

  if (!membership) {
    throw new TeamMembershipError("Team member not found.");
  }

  if (!input.isActive && membership.role === "owner") {
    const activeOwners = await countActiveOwners(supabase, input.organisationId);

    if (activeOwners <= 1) {
      throw new TeamMembershipError(
        "This is the only owner on this organisation, so their access can't be removed.",
      );
    }
  }

  const { error } = await supabase
    .from("organisation_memberships")
    .update({ is_active: input.isActive })
    .eq("id", input.membershipId)
    .eq("organisation_id", input.organisationId);

  if (error) {
    throw new TeamMembershipError("Could not update this team member. Please try again.");
  }
}
