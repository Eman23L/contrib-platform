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
      return "The sign-in request could not be completed. Try again.";
    case "invalid_credentials":
      return "Invalid email or password.";
    case "missing_code":
      return "The sign-in link was incomplete.";
    case "unauthorized_role":
      return "This account does not have an active admin role.";
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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.72),_transparent_34%),radial-gradient(circle_at_85%_18%,_rgba(219,234,254,0.9),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full gap-5 rounded-[2rem] border border-white/70 bg-white/45 p-3 shadow-[0_32px_100px_rgba(37,99,235,0.13)] backdrop-blur-2xl sm:p-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4">
          <AuthBrandPanel compact />

          <div className="flex items-center">
            <AuthCard
              helperText="Access your workspace securely"
              signedInBanner={
                errorMessage ? (
                  <div
                    aria-live="polite"
                    className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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
