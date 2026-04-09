import Link from "next/link";

import { AdminPasswordSignInForm } from "@/components/auth/AdminPasswordSignInForm";
import { getAuthenticatedServerUser } from "@/lib/supabase/server";

const PROTOTYPE_ADMIN_PATH = "/admin?org=grace-community";
const PROTOTYPE_GUEST_PATH = "/o/grace-community";

export default async function HomePage() {
  const authenticatedUser = await getAuthenticatedServerUser();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.32),_transparent_30%),linear-gradient(180deg,_#f3efe3_0%,_#f8f6f1_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <section className="grid w-full gap-6 rounded-[2rem] border border-black/10 bg-white/80 p-5 shadow-[0_30px_90px_rgba(20,83,45,0.12)] backdrop-blur sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,_rgba(240,248,242,0.96)_0%,_rgba(228,240,232,0.92)_100%)] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">
              GetFlow
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Admin access for the current prototype
            </h1>
            <p className="mt-4 text-lg font-medium text-black/70">
              Secure giving operations made simple
            </p>
            <p className="mt-6 max-w-xl text-sm leading-7 text-black/65 sm:text-base">
              Sign in as an authorised church administrator to manage contributions,
              review dashboard activity, and inspect payment records. Guest giving
              remains available through the public organisation experience.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-black/8 bg-white/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Platform
                </p>
                <p className="mt-2 text-base font-semibold text-ink">GetFlow</p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-white/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Admin auth
                </p>
                <p className="mt-2 text-base font-semibold text-ink">Email + password</p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-white/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Guest path
                </p>
                <p className="mt-2 text-base font-semibold text-ink">Grace Community</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <section className="w-full rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Admin Sign-In
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Sign in with your email and password
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
                Access is still enforced server-side after sign-in. Only users with
                active owner, admin, or finance memberships can reach admin routes.
              </p>

              {authenticatedUser ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <p>
                    Signed in as
                    <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs">
                      {authenticatedUser.user.email ?? "admin user"}
                    </code>
                  </p>
                  <Link
                    className="mt-3 inline-flex text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4 transition hover:text-accent/80"
                    href={PROTOTYPE_ADMIN_PATH}
                  >
                    Go to admin dashboard
                  </Link>
                </div>
              ) : null}

              <div className="mt-6">
                <AdminPasswordSignInForm nextPath={PROTOTYPE_ADMIN_PATH} />
              </div>

              <div className="mt-6 text-center">
                <Link
                  className="text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4 transition hover:text-accent/80"
                  href={PROTOTYPE_GUEST_PATH}
                >
                  Continue as guest
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
