import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getAdminOrganisationBySlug,
} from "@/lib/db/queries/admin";
import {
  listAdminContributionRows,
  listAdminContributionSummaryRows,
  type AdminContributionsFilters,
} from "@/lib/db/queries/adminContributions";
import { listActiveFundsByOrganisationId } from "@/lib/db/queries/funds";
import type {
  AdminContributionFiltersData,
  AdminContributionListItem,
  AdminContributionsPageData,
  AdminSummary,
} from "@/types/api";
import type { ContributionIntent } from "@/types/domain";

function shortenContributionId(id: string) {
  return id.slice(0, 8);
}

function toDisplayStatus(status: ContributionIntent["status"]) {
  if (status === "draft") {
    return "created";
  }

  return status;
}

function getContributionSummary(
  rows: Array<{ amount_minor: number; status: ContributionIntent["status"] }>,
): AdminSummary {
  return rows.reduce<AdminSummary>(
    (summary, row) => {
      summary.totalContributionsCount += 1;
      summary.totalContributedAmountMinor += row.amount_minor;

      if (row.status === "succeeded") {
        summary.totalSucceededAmountMinor += row.amount_minor;
      }

      return summary;
    },
    {
      totalContributionsCount: 0,
      totalContributedAmountMinor: 0,
      totalSucceededAmountMinor: 0,
    },
  );
}

export async function getAdminContributions(
  supabase: SupabaseClient,
  orgSlug: string,
  filters: Omit<AdminContributionsFilters, "organisationId">,
): Promise<AdminContributionsPageData | null> {
  const organisation = await getAdminOrganisationBySlug(supabase, orgSlug);

  if (!organisation) {
    return null;
  }

  const scopedFilters: AdminContributionsFilters = {
    organisationId: organisation.id,
    ...filters,
  };

  const [contributionRows, summaryRows, funds] = await Promise.all([
    listAdminContributionRows(supabase, scopedFilters),
    listAdminContributionSummaryRows(supabase, scopedFilters),
    listActiveFundsByOrganisationId(supabase, organisation.id),
  ]);

  const contributions: AdminContributionListItem[] = contributionRows.map((row) => ({
    amountMinor: row.amount_minor,
    createdAt: row.created_at,
    currencyCode: row.currency_code,
    donorName: row.donor_name,
    guestEmail: row.guest_email,
    id: row.id,
    organisationName: row.organisations?.name ?? organisation.name,
    paidAt: row.paid_at,
    paymentProvider: row.payment_provider,
    shortId: shortenContributionId(row.id),
    status: toDisplayStatus(row.status),
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    fundName: row.funds?.name ?? null,
  }));

  const filterData: AdminContributionFiltersData = {
    availableFunds: funds.map((fund) => ({
      id: fund.id,
      name: fund.name,
    })),
    organisationName: organisation.name,
    organisationSlug: organisation.slug,
    selectedFundId: filters.fundId ?? "",
    selectedStatus: filters.status ?? "",
    startDate: filters.startDate ?? "",
    endDate: filters.endDate ?? "",
  };

  return {
    contributions,
    filters: filterData,
    organisationId: organisation.id,
    organisationName: organisation.name,
    organisationSlug: organisation.slug,
    summary: getContributionSummary(summaryRows),
  };
}
