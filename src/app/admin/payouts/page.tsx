import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminDashboardChrome } from "@/components/admin/AdminDashboardChrome";
import { AdminPayoutsTable } from "@/components/admin/AdminPayoutsTable";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { getAdminPayouts } from "@/lib/services/admin/getAdminPayouts";

type PayoutsPageProps = {
  searchParams: Promise<{ org?: string }>;
};

function formatAmount(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

function UnauthorizedState({
  availableOrgs,
  userEmail,
}: {
  availableOrgs: Array<{ name: string; role: string; slug: string }>;
  userEmail: string | null;
}) {
  return (
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="text-sm font-medium text-red-700">Access needed</p>
          <h1 className="gf-title mt-3">
            Payouts are only available to organisation owners, admins, and finance roles.
          </h1>
          <p className="gf-copy mt-4">
            You are signed in, but this account does not have access to payout data.
          </p>
          {userEmail ? (
            <p className="mt-3 text-sm text-slate-500">Signed in as {userEmail}.</p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link className="gf-button-primary" href="/account">
              Go to my account
            </Link>
          </div>
          {availableOrgs.length > 0 ? (
            <div className="mt-6 space-y-3">
              {availableOrgs.map((organisation) => (
                <Link
                  className="gf-card-soft flex items-center justify-between gap-4 px-4 py-4 transition hover:border-[#b7d9bd] hover:bg-accentSoft"
                  href={`/admin/payouts?org=${organisation.slug}`}
                  key={organisation.slug}
                >
                  <span className="block text-base font-semibold text-slate-950">
                    {organisation.name}
                  </span>
                  <span className="text-sm font-medium text-[#5f7f66]">Open payouts</span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default async function AdminPayoutsPage({ searchParams }: PayoutsPageProps) {
  const params = await searchParams;
  const requestedPath = `/admin/payouts${params.org ? `?org=${encodeURIComponent(params.org)}` : ""}`;
  const access = await requireAdminRole(params.org, requestedPath);

  if (access.kind === "unauthenticated") {
    redirect(access.signInPath);
  }

  if (access.kind === "missing_organisation") {
    if (access.memberships.length === 1) {
      redirect(`/admin/payouts?org=${access.memberships[0]?.organisationSlug}`);
    }

    redirect("/admin");
  }

  if (access.kind === "unauthorized") {
    return (
      <UnauthorizedState
        availableOrgs={access.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        userEmail={access.user.email ?? null}
      />
    );
  }

  const data = await getAdminPayouts();

  return (
    <AdminDashboardChrome
      activeSection="payouts"
      organisationName={access.value.membership.organisationName}
      organisationSlug={access.value.membership.organisationSlug}
      userEmail={access.value.user.email ?? null}
    >
      <div className="space-y-5 p-5 xl:p-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Payouts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real Stripe balance and payout data for the platform&apos;s single shared
            Stripe account.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <AdminStatCard
            hint="Funds Stripe has settled and can pay out next."
            label="Available Balance"
            value={formatAmount(data.availableBalanceMinor, data.currencyCode)}
          />
          <AdminStatCard
            hint="Funds from recent charges still clearing before payout."
            label="Pending Balance"
            value={formatAmount(data.pendingBalanceMinor, data.currencyCode)}
          />
        </section>

        <AdminPayoutsTable formatAmount={formatAmount} payouts={data.payouts} />
      </div>
    </AdminDashboardChrome>
  );
}
