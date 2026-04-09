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

function MissingOrganisationState({
  availableOrgs,
  userEmail,
}: MissingOrganisationStateProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f4efe1_0%,_#f8f6f1_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-[0_28px_80px_rgba(20,83,45,0.1)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">
            Admin Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Choose an organisation
          </h1>
          <p className="mt-4 text-base leading-7 text-black/70">
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
                className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 transition hover:border-accent/30 hover:bg-accentSoft/20"
                href={`/admin?org=${organisation.slug}`}
                key={organisation.slug}
              >
                <span>
                  <span className="block text-base font-semibold text-ink">
                    {organisation.name}
                  </span>
                  <span className="mt-1 block text-sm text-black/60">
                    Role: {organisation.role}
                  </span>
                </span>
                <span className="text-sm font-medium text-accent">Open dashboard</span>
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
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff4ef_0%,_#f8f6f1_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-red-200/80 bg-white/90 p-6 shadow-[0_28px_80px_rgba(127,29,29,0.1)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-700">
            Unauthorized
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            You do not have access to this dashboard
          </h1>
          <p className="mt-4 text-base leading-7 text-black/70">
            Signed in as
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              {userEmail ?? "unknown user"}
            </code>
            . Access to
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              {requestedOrgSlug ?? "this organisation"}
            </code>
            requires an active
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              organisation_memberships
            </code>
            record with role
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              owner
            </code>
            ,
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              admin
            </code>
            , or
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              finance
            </code>
            .
          </p>

          {availableOrgs.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-medium text-black/65">
                You can still access these authorised dashboards:
              </p>
              <div className="mt-4 space-y-3">
                {availableOrgs.map((organisation) => (
                  <Link
                    className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 transition hover:border-accent/30 hover:bg-accentSoft/20"
                    href={`/admin?org=${organisation.slug}`}
                    key={organisation.slug}
                  >
                    <span>
                      <span className="block text-base font-semibold text-ink">
                        {organisation.name}
                      </span>
                      <span className="mt-1 block text-sm text-black/60">
                        Role: {organisation.role}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-accent">Open dashboard</span>
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,249,157,0.28),_transparent_30%),linear-gradient(180deg,_#f4efe1_0%,_#f8f6f1_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-[0_30px_80px_rgba(20,83,45,0.12)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-accent">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {dashboard.organisationName}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-black/65 sm:text-base">
                Contribution activity, recent giving, and basic fund-level reporting
                for authorised finance and admin users.
              </p>
            </div>
            <form action="/auth/sign-out" method="post">
              <button
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-accent/30 hover:bg-accentSoft/20"
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
