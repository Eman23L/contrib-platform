import { redirect } from "next/navigation";

import {
  AuthBrandPanel,
  AuthCard,
} from "@/components/auth/AuthExperiencePanels";
import { AdminPasswordSignInForm } from "@/components/auth/AdminPasswordSignInForm";
import { buildAdminPath } from "@/lib/auth/requireAdminRole";
import { getAuthenticatedServerUser } from "@/lib/supabase/server";

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
  const authenticatedUser = await getAuthenticatedServerUser();

  if (authenticatedUser) {
    redirect(nextPath);
  }

  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-6xl">
        <section className="gf-frame grid gap-4 p-3 sm:p-4 lg:grid-cols-[1.08fr_0.92fr]">
          <AuthBrandPanel compact />

          <div className="flex items-center">
            <AuthCard
              helperText="Sign in to manage giving with clarity"
              signedInBanner={
                errorMessage ? (
                  <div
                    aria-live="polite"
                    className="gf-notice mt-5 border-red-200 bg-red-50 text-red-700"
                  >
                    {errorMessage}
                  </div>
                ) : null
              }
            >
              <AdminPasswordSignInForm nextPath={nextPath} />
            </AuthCard>
          </div>
        </section>
      </div>
    </main>
  );
}
