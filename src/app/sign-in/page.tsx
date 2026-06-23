import { UnifiedSignInCard } from "@/components/auth/UnifiedSignInCard";
import { buildAdminPath } from "@/lib/auth/requireAdminRole";

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

  if (next === "/admin" || next.startsWith("/admin?")) {
    return next;
  }

  return buildAdminPath();
}

const DEFAULT_PUBLIC_PATH = "/account";

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

  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <UnifiedSignInCard
          adminNextPath={nextPath}
          guestHref="/o/grace-community/give"
          initialError={errorMessage}
          publicNextPath={publicNextPath}
        />
      </div>
    </main>
  );
}
