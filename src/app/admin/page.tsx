import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminFundBreakdown } from "@/components/admin/AdminFundBreakdown";
import { AdminRecentContributions } from "@/components/admin/AdminRecentContributions";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminStatusSummary } from "@/components/admin/AdminStatusSummary";
import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { getAdminDashboard } from "@/lib/services/admin/getAdminDashboard";

type AdminPageProps = {
  searchParams: Promise<{ org?: string }>;
};

function formatGbp(amountMinor: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountMinor / 100);
}

type MissingOrganisationStateProps = {
  availableOrgs: Array<{
    name: string;
    role: string;
    slug: string;
  }>;
  userEmail: string | null;
};

type UnauthorizedStateProps = {
  availableOrgs: Array<{
    name: string;
    role: string;
    slug: string;
  }>;
  requestedOrgSlug: string | null;
  userEmail: string | null;
};

function buildGivingPath(orgSlug?: string | null) {
  return `/o/${orgSlug ?? "grace-community"}/give`;
}

function MissingOrganisationState({
  availableOrgs,
  userEmail,
}: MissingOrganisationStateProps) {
  return (
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="gf-kicker">
            GetFlow
          </p>
          <h1 className="gf-title mt-3">
            Choose an organisation
          </h1>
          <p className="gf-copy mt-4">
            Signed in as
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              {userEmail ?? "unknown user"}
            </code>
            . Select one of the organisations where you hold an admin or finance
            role.
          </p>
          <div className="mt-6 space-y-3">
            {availableOrgs.map((organisation) => (
              <Link
                className="gf-card-soft flex items-center justify-between gap-4 px-4 py-4 transition hover:border-[#b7d9bd] hover:bg-accentSoft"
                href={`/admin?org=${organisation.slug}`}
                key={organisation.slug}
              >
                <span>
                  <span className="block text-base font-semibold text-slate-950">
                    {organisation.name}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Role: {organisation.role}
                  </span>
                </span>
                <span className="text-sm font-medium text-[#5f7f66]">Open dashboard</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function UnauthorizedState({
  availableOrgs,
  requestedOrgSlug,
  userEmail,
}: UnauthorizedStateProps) {
  const givingPath = buildGivingPath(requestedOrgSlug);

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="text-sm font-medium text-red-700">
            Access needed
          </p>
          <h1 className="gf-title mt-3">
            This dashboard is only available to organisation admins.
          </h1>
          <p className="gf-copy mt-4">
            You are signed in, but this account does not have admin access.
          </p>
          {userEmail ? (
            <p className="mt-3 text-sm text-slate-500">
              Signed in as {userEmail}.
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link className="gf-button-primary" href={givingPath}>
              Go to giving page
            </Link>
            <form action="/auth/sign-out" method="post">
              <button className="gf-button-secondary w-full sm:w-auto" type="submit">
                Sign in with a different account
              </button>
            </form>
          </div>

          {availableOrgs.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-600">
                You can still open these organisations:
              </p>
              <div className="mt-4 space-y-3">
                {availableOrgs.map((organisation) => (
                  <Link
                    className="gf-card-soft flex items-center justify-between gap-4 px-4 py-4 transition hover:border-[#b7d9bd] hover:bg-accentSoft"
                    href={`/admin?org=${organisation.slug}`}
                    key={organisation.slug}
                  >
                    <span>
                      <span className="block text-base font-semibold text-slate-950">
                        {organisation.name}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-[#5f7f66]">Open dashboard</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { org } = await searchParams;
  const access = await requireAdminRole(org);

  if (access.kind === "unauthenticated") {
    redirect(access.signInPath);
  }

  if (access.kind === "missing_organisation") {
    if (access.memberships.length === 1) {
      redirect(`/admin?org=${access.memberships[0]?.organisationSlug}`);
    }

    return (
      <MissingOrganisationState
        availableOrgs={access.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        userEmail={access.user.email ?? null}
      />
    );
  }

  if (access.kind === "unauthorized") {
    return (
      <UnauthorizedState
        availableOrgs={access.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        requestedOrgSlug={access.requestedOrgSlug}
        userEmail={access.user.email ?? null}
      />
    );
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const dashboard = await getAdminDashboard(supabase, access.value.membership.organisationSlug);

  if (!dashboard) {
    return (
      <UnauthorizedState
        availableOrgs={access.value.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        requestedOrgSlug={access.value.membership.organisationSlug}
        userEmail={access.value.user.email ?? null}
      />
    );
  }

  return (
    <main className="gf-page">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="gf-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="gf-kicker">
                GetFlow dashboard
              </p>
              <h1 className="gf-title mt-3">
                {dashboard.organisationName}
              </h1>
              <p className="gf-copy mt-3 max-w-3xl">
                Manage giving with clear activity, fund totals, and recent
                supporter records.
              </p>
            </div>
            <form action="/auth/sign-out" method="post">
              <button
                className="gf-button-secondary"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard
              hint="All contribution intents recorded for this organisation."
              label="Total Contributions"
              value={dashboard.summary.totalContributionsCount.toLocaleString("en-GB")}
            />
            <AdminStatCard
              hint="Combined amount across all recorded statuses."
              label="Total Contributed"
              value={formatGbp(dashboard.summary.totalContributedAmountMinor)}
            />
            <AdminStatCard
              hint="Only contributions confirmed as succeeded."
              label="Succeeded Amount"
              value={formatGbp(dashboard.summary.totalSucceededAmountMinor)}
            />
            <AdminStatCard
              hint={`Signed in as ${access.value.user.email ?? "admin user"}.`}
              label="Organisation"
              value={dashboard.organisationSlug}
            />
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <AdminRecentContributions
            contributions={dashboard.recentContributions}
            formatAmount={formatGbp}
          />
          <div className="space-y-6">
            <AdminStatusSummary
              formatAmount={formatGbp}
              statuses={dashboard.statusSummary}
            />
            <AdminFundBreakdown
              formatAmount={formatGbp}
              funds={dashboard.fundBreakdown}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
