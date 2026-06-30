import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { getSafeInternalPath } from "@/lib/auth/urls";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getSafeNextPath(next?: string) {
  const safePath = getSafeInternalPath(next);

  if (
    safePath === "/admin" ||
    safePath.startsWith("/admin/") ||
    safePath.startsWith("/admin?") ||
    safePath.startsWith("/admin#")
  ) {
    return safePath;
  }

  return DEFAULT_PUBLIC_PATH;
}

const DEFAULT_PUBLIC_PATH = "/account";
const DEFAULT_GUEST_GIVING_PATH = "/o/grace-community/give";

function getGuestGivingPath(nextPath: string) {
  try {
    const url = new URL(nextPath, "https://getflow.local");
    const orgSlug = url.searchParams.get("org")?.trim();

    if (orgSlug) {
      return `/o/${encodeURIComponent(orgSlug)}/give`;
    }
  } catch {
    return DEFAULT_GUEST_GIVING_PATH;
  }

  return DEFAULT_GUEST_GIVING_PATH;
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
  const publicNextPath = DEFAULT_PUBLIC_PATH;
  const guestGivingPath = getGuestGivingPath(nextPath);

  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard
          adminNextPath={nextPath}
          guestHref={guestGivingPath}
          initialError={errorMessage}
          publicNextPath={publicNextPath}
          startNextPath={nextPath}
        />
      </div>
    </main>
  );
}
