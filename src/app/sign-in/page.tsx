import { redirect } from "next/navigation";

import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { buildAdminPath } from "@/lib/auth/requireAdminRole";
import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import {
  createServerSupabaseUserClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getSafeNextPath(next?: string) {
  if (!next || !next.startsWith("/")) {
    return buildAdminPath();
  }

  return next;
}

const DEFAULT_PUBLIC_PATH = "/o/grace-community/give";

function getPublicNextPath(nextPath: string) {
  if (nextPath.startsWith("/o/")) {
    return nextPath;
  }

  return DEFAULT_PUBLIC_PATH;
}

function getErrorMessage(error?: string) {
  switch (error) {
    case "auth_callback_failed":
      return "We could not complete sign-in. Please try again.";
    case "invalid_credentials":
      return "Invalid email or password.";
    case "missing_code":
      return "The sign-in link was incomplete.";
    case "unauthorized_role":
      return "This account does not have access to manage this organisation.";
    default:
      return null;
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params.next);
  const publicNextPath = getPublicNextPath(nextPath);
  const authenticatedUser = await getAuthenticatedServerUser();

  if (authenticatedUser) {
    const supabase = createServerSupabaseUserClient(authenticatedUser.accessToken);
    const memberships = await listAdminMembershipsForUser(
      supabase,
      authenticatedUser.user.id,
    );

    redirect(memberships.length > 0 ? nextPath : publicNextPath);
  }

  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard
          adminNextPath={nextPath}
          guestHref={publicNextPath}
          initialError={errorMessage}
          publicNextPath={publicNextPath}
        />
      </div>
    </main>
  );
}
