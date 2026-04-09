import { redirect } from "next/navigation";

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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f4efe1_0%,_#f8f6f1_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
        <section className="grid w-full gap-6 rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-[0_30px_80px_rgba(20,83,45,0.12)] sm:p-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,_rgba(27,94,32,0.95)_0%,_rgba(39,124,63,0.92)_100%)] p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
              Admin Sign-In
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Secure access for church administrators
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
              Sign in with your approved admin email. Access is granted only when
              your Supabase user is mapped to an active
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                organisation_memberships
              </code>
              record with the role
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                owner
              </code>
              ,
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                admin
              </code>
              , or
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                finance
              </code>
              .
            </p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Admin access now uses email and password authentication through
              Supabase Auth. Role enforcement still happens server-side after sign-in.
            </p>
            <p className="mt-6 text-sm text-white/70">
              After signing in, you will be returned to
              <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                {nextPath}
              </code>
            </p>
          </div>

          <div className="flex items-center">
            <div className="w-full">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Admin Access
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                Sign in with your email and password
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/65">
                Use an email address that already exists in Supabase Auth and has an
                active admin, owner, or finance membership.
              </p>

              {errorMessage ? (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="mt-6">
                <AdminPasswordSignInForm nextPath={nextPath} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
