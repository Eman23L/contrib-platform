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
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="text-sm font-medium text-red-700">
            Access needed
          </p>
          <h1 className="gf-title mt-3">
            You do not have access to this contribution view
          </h1>
          <p className="gf-copy mt-4">
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
                  className="gf-card-soft flex items-center justify-between gap-4 px-4 py-4 transition hover:border-[#b7d9bd] hover:bg-accentSoft"
                  href={`/admin/contributions?org=${organisation.slug}`}
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
                  <span className="text-sm font-medium text-[#5f7f66]">Open contributions</span>
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
    <main className="gf-page">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="gf-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="gf-kicker">
                Giving records
              </p>
              <h1 className="gf-title mt-3">
                {data.organisationName}
              </h1>
              <p className="gf-copy mt-3 max-w-3xl">
                Review gifts, payment status, and receipt details for this
                organisation.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="gf-button-secondary"
                href={`/admin?org=${data.organisationSlug}`}
              >
                Back to dashboard
              </Link>
              <form action="/auth/sign-out" method="post">
                <button
                  className="gf-button-secondary w-full sm:w-auto"
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
