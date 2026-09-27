import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { getAdminOrganisationBySlug } from "@/lib/db/queries/admin";
import {
  addOrUpdateTeamMembership,
  setTeamMembershipActive,
  TeamMembershipError,
} from "@/lib/db/mutations/teamMembership";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import {
  validateMembershipId,
  validateTeamInviteForm,
} from "@/lib/validators/team";

function redirectToTeam(
  request: NextRequest,
  orgSlug: string | null,
  params: Record<string, string>,
) {
  const url = new URL("/admin", request.url);

  if (orgSlug) {
    url.searchParams.set("org", orgSlug);
  }

  url.searchParams.set("section", "team");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const currentOrgSlug = formData.get("currentOrgSlug");

  if (typeof currentOrgSlug !== "string" || !currentOrgSlug.trim()) {
    return redirectToTeam(request, null, {
      teamError: "Missing organisation context.",
    });
  }

  const orgSlug = currentOrgSlug.trim();
  const access = await requireAdminRole(orgSlug);

  if (access.kind === "unauthenticated") {
    return NextResponse.redirect(new URL(access.signInPath, request.url));
  }

  if (access.kind !== "authenticated") {
    return redirectToTeam(request, orgSlug, {
      teamError: "This account cannot manage team members for this organisation.",
    });
  }

  const role = access.value.membership.role;

  if (role !== "owner" && role !== "admin") {
    return redirectToTeam(request, orgSlug, {
      teamError: "Only owners and admins can manage team members.",
    });
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const organisation = await getAdminOrganisationBySlug(supabase, orgSlug);

  if (!organisation) {
    return redirectToTeam(request, orgSlug, {
      teamError: "Organisation was not found.",
    });
  }

  const intent = formData.get("intent");

  try {
    if (intent === "deactivate" || intent === "reactivate") {
      const validated = validateMembershipId(formData);

      if (!validated.ok) {
        return redirectToTeam(request, orgSlug, { teamError: validated.error });
      }

      await setTeamMembershipActive(supabase, {
        isActive: intent === "reactivate",
        membershipId: validated.value,
        organisationId: organisation.id,
      });
    } else {
      const validated = validateTeamInviteForm(formData);

      if (!validated.ok) {
        return redirectToTeam(request, orgSlug, { teamError: validated.error });
      }

      await addOrUpdateTeamMembership(supabase, {
        email: validated.value.email,
        organisationId: organisation.id,
        role: validated.value.role,
      });
    }

    revalidatePath("/admin");

    return redirectToTeam(request, organisation.slug, { teamSaved: "1" });
  } catch (error) {
    const message =
      error instanceof TeamMembershipError
        ? error.message
        : "Could not update the team. Please try again.";

    return redirectToTeam(request, orgSlug, { teamError: message });
  }
}
