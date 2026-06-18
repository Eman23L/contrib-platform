import Link from "next/link";

import {
  AuthBrandPanel,
  AuthCard,
  GuestLink,
} from "@/components/auth/AuthExperiencePanels";
import { AdminPasswordSignInForm } from "@/components/auth/AdminPasswordSignInForm";
import { getAuthenticatedServerUser } from "@/lib/supabase/server";

const ADMIN_PATH = "/admin?org=grace-community";
const GUEST_PATH = "/o/grace-community";

export default async function HomePage() {
  const authenticatedUser = await getAuthenticatedServerUser();

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-6xl">
        <section className="gf-frame grid gap-4 p-3 sm:p-4 lg:grid-cols-[1.08fr_0.92fr]">
          <AuthBrandPanel />

          <div className="flex items-center">
            <AuthCard
              footer={<GuestLink href={GUEST_PATH} />}
              signedInBanner={
                authenticatedUser ? (
                  <div className="gf-notice mt-5 border-emerald-200 bg-emerald-50 text-emerald-800">
                    <p>
                      You are signed in as{" "}
                      <span className="font-medium">
                        {authenticatedUser.user.email ?? "an authorised user"}
                      </span>
                      .
                    </p>
                    <Link
                      className="gf-link mt-3 inline-flex"
                      href={ADMIN_PATH}
                    >
                      Open dashboard
                    </Link>
                  </div>
                ) : null
              }
            >
              <AdminPasswordSignInForm nextPath={ADMIN_PATH} />
            </AuthCard>
          </div>
        </section>
      </div>
    </main>
  );
}
