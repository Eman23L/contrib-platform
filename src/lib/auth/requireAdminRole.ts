import "server-only";

import type { User } from "@supabase/supabase-js";

import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import { getSafeInternalPath } from "@/lib/auth/urls";
import {
  createServerSupabaseUserClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";
import type { OrganisationMembership } from "@/types/domain";

type AuthorizedAdmin = {
  accessToken: string;
  membership: OrganisationMembership;
  memberships: OrganisationMembership[];
  user: User;
};

type RequireAdminRoleResult =
  | {
      kind: "authenticated";
      value: AuthorizedAdmin;
    }
  | {
      kind: "missing_organisation";
      memberships: OrganisationMembership[];
      user: User;
    }
  | {
      kind: "unauthenticated";
      signInPath: string;
    }
  | {
      kind: "unauthorized";
      memberships: OrganisationMembership[];
      requestedOrgSlug: string | null;
      user: User;
    };

export function buildAdminPath(orgSlug?: string) {
  if (!orgSlug) {
    return "/admin";
  }

  return `/admin?org=${encodeURIComponent(orgSlug)}`;
}

export function buildSignInPath(nextPath: string) {
  return `/sign-in?next=${encodeURIComponent(getSafeInternalPath(nextPath))}`;
}

export async function requireAdminRole(
  orgSlug?: string,
  nextPath?: string,
): Promise<RequireAdminRoleResult> {
  const authenticatedUser = await getAuthenticatedServerUser();

  if (!authenticatedUser) {
    return {
      kind: "unauthenticated",
      signInPath: buildSignInPath(nextPath ?? buildAdminPath(orgSlug)),
    };
  }

  const supabase = createServerSupabaseUserClient(authenticatedUser.accessToken);
  const memberships = await listAdminMembershipsForUser(
    supabase,
    authenticatedUser.user.id,
  );

  if (memberships.length === 0) {
    return {
      kind: "unauthorized",
      memberships,
      requestedOrgSlug: orgSlug ?? null,
      user: authenticatedUser.user,
    };
  }

  if (!orgSlug) {
    return {
      kind: "missing_organisation",
      memberships,
      user: authenticatedUser.user,
    };
  }

  const membership =
    memberships.find((item) => item.organisationSlug === orgSlug) ?? null;

  if (!membership) {
    return {
      kind: "unauthorized",
      memberships,
      requestedOrgSlug: orgSlug,
      user: authenticatedUser.user,
    };
  }

  return {
    kind: "authenticated",
    value: {
      accessToken: authenticatedUser.accessToken,
      membership,
      memberships,
      user: authenticatedUser.user,
    },
  };
}
