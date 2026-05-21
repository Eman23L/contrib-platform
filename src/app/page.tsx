import Link from "next/link";

import {
  AuthBrandPanel,
  AuthCard,
  GuestLink,
} from "@/components/auth/AuthExperiencePanels";
import { AdminPasswordSignInForm } from "@/components/auth/AdminPasswordSignInForm";
import { getAuthenticatedServerUser } from "@/lib/supabase/server";

const PROTOTYPE_ADMIN_PATH = "/admin?org=grace-community";
const PROTOTYPE_GUEST_PATH = "/o/grace-community";

export default async function HomePage() {
  const authenticatedUser = await getAuthenticatedServerUser();

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.72),_transparent_34%),radial-gradient(circle_at_85%_18%,_rgba(219,234,254,0.9),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef6ff_100%)] px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full gap-5 rounded-[2rem] border border-white/70 bg-white/45 p-3 shadow-[0_32px_100px_rgba(37,99,235,0.13)] backdrop-blur-2xl sm:p-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4">
          <AuthBrandPanel />

          <div className="flex items-center">
            <AuthCard
              footer={<GuestLink href={PROTOTYPE_GUEST_PATH} />}
              signedInBanner={
                authenticatedUser ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <p>
                      You are signed in as{" "}
                      <span className="font-medium">
                        {authenticatedUser.user.email ?? "an authorised user"}
                      </span>
                      .
                    </p>
                    <Link
                      className="mt-3 inline-flex text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
                      href={PROTOTYPE_ADMIN_PATH}
                    >
                      Go to workspace
                    </Link>
                  </div>
                ) : null
              }
            >
              <AdminPasswordSignInForm nextPath={PROTOTYPE_ADMIN_PATH} />
            </AuthCard>
          </div>
        </section>
      </div>
    </main>
  );
}
