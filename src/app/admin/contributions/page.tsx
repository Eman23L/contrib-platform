import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminContributionFilters } from "@/components/admin/AdminContributionFilters";
import { AdminContributionsTable } from "@/components/admin/AdminContributionsTable";
import { AdminContributionSummary } from "@/components/admin/AdminContributionSummary";
import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { getAdminContributions } from "@/lib/services/admin/getAdminContributions";
import type { ContributionIntent } from "@/types/domain";

type ContributionsPageProps = {
  searchParams: Promise<{
    end?: string;
    fund?: string;
    org?: string;
    start?: string;
    status?: string;
  }>;
};

function formatAmount(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

function getValidatedStatus(value?: string): ContributionIntent["status"] | undefined {
  if (
    value === "draft" ||
    value === "checkout_created" ||
    value === "pending_payment" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "cancelled" ||
    value === "expired"
  ) {
    return value;
  }

  return undefined;
}

function getValidatedDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function UnauthorizedState({
  availableOrgs,
  requestedOrgSlug,
  userEmail,
}: {
  availableOrgs: Array<{ name: string; role: string; slug: string }>;
  requestedOrgSlug: string | null;
  userEmail: string | null;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff4ef_0%,_#f8f6f1_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-red-200/80 bg-white/90 p-6 shadow-[0_28px_80px_rgba(127,29,29,0.1)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-red-700">
            Unauthorized
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            You do not have access to this contribution view
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
            requires an active admin, owner, or finance membership.
          </p>

          {availableOrgs.length > 0 ? (
            <div className="mt-6 space-y-3">
              {availableOrgs.map((organisation) => (
                <Link
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 transition hover:border-accent/30 hover:bg-accentSoft/20"
                  href={`/admin/contributions?org=${organisation.slug}`}
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
                  <span className="text-sm font-medium text-accent">Open contributions</span>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default async function AdminContributionsPage({
  searchParams,
}: ContributionsPageProps) {
  const params = await searchParams;
  const requestedPath = `/admin/contributions${params.org ? `?org=${encodeURIComponent(params.org)}` : ""}`;
  const access = await requireAdminRole(params.org, requestedPath);

  if (access.kind === "unauthenticated") {
    redirect(access.signInPath);
  }

  if (access.kind === "missing_organisation") {
    if (access.memberships.length === 1) {
      redirect(`/admin/contributions?org=${access.memberships[0]?.organisationSlug}`);
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
        requestedOrgSlug={access.requestedOrgSlug}
        userEmail={access.user.email ?? null}
      />
    );
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const data = await getAdminContributions(
    supabase,
    access.value.membership.organisationSlug,
    {
      endDate: getValidatedDate(params.end),
      fundId: params.fund || undefined,
      startDate: getValidatedDate(params.start),
      status: getValidatedStatus(params.status),
    },
  );

  if (!data) {
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
                Admin Contributions
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {data.organisationName}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-black/65 sm:text-base">
                Inspect real contribution records, payment states, and Stripe session
                references for the selected organisation.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-accent/30 hover:bg-accentSoft/20"
                href={`/admin?org=${data.organisationSlug}`}
              >
                Back to dashboard
              </Link>
              <form action="/auth/sign-out" method="post">
                <button
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink transition hover:border-accent/30 hover:bg-accentSoft/20 sm:w-auto"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </section>

        <AdminContributionFilters filters={data.filters} />
        <AdminContributionSummary
          formatAmount={(amountMinor) => formatAmount(amountMinor, "GBP")}
          summary={data.summary}
        />
        <AdminContributionsTable
          contributions={data.contributions}
          formatAmount={formatAmount}
        />
      </div>
    </main>
  );
}
