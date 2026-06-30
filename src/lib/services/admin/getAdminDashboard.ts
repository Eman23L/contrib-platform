import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getAdminOrganisationBySlug,
  listAdminFundTotalsRows,
  listAdminRecentContributionRows,
  listAdminStatusTotalsRows,
  listAdminSummaryRows,
  type AdminFundTotalsRow,
  type AdminStatusTotalsRow,
} from "@/lib/db/queries/admin";
import type {
  AdminDashboardData,
  AdminFundBreakdownItem,
  AdminRecentContribution,
  AdminStatusSummaryItem,
  AdminSummary,
} from "@/types/api";
import type { ContributionIntent } from "@/types/domain";

function shortenContributionId(id: string) {
  return id.slice(0, 8);
}

function toDashboardStatusLabel(status: ContributionIntent["status"]) {
  if (status === "draft") {
    return "created";
  }

  return status;
}

function getStatusSortOrder(status: string) {
  switch (status) {
    case "created":
      return 0;
    case "checkout_created":
      return 1;
    case "pending_payment":
      return 2;
    case "succeeded":
      return 3;
    case "failed":
      return 4;
    case "cancelled":
      return 5;
    case "expired":
      return 6;
    default:
      return 7;
  }
}

function getActiveSupportersCount(
  rows: Array<{ guest_email: string | null }>,
) {
  return new Set(
    rows
      .map((row) => row.guest_email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email)),
  ).size;
}

export function getAdminOverallSummary(
  rows: Array<{ amount_minor: number; status: ContributionIntent["status"] }>,
): AdminSummary {
  return rows.reduce<AdminSummary>(
    (summary, row) => {
      summary.totalContributionsCount += 1;

      if (row.status === "succeeded") {
        summary.totalContributedAmountMinor += row.amount_minor;
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

export function getAdminRecentContributions(
  rows: Awaited<ReturnType<typeof listAdminRecentContributionRows>>,
): AdminRecentContribution[] {
  return rows.map((row) => ({
    id: row.id,
    shortId: shortenContributionId(row.id),
    createdAt: row.created_at,
    organisationName: row.organisations?.name ?? "Unknown organisation",
    fundName: row.funds?.name ?? null,
    amountMinor: row.amount_minor,
    status: toDashboardStatusLabel(row.status),
    guestEmail: row.guest_email,
    donorName: row.donor_name,
  }));
}

export function getAdminTotalsByFund(
  rows: AdminFundTotalsRow[],
): AdminFundBreakdownItem[] {
  const fundMap = new Map<string, AdminFundBreakdownItem>();

  for (const row of rows) {
    const fundId = row.fund_id ?? "unassigned";
    const current = fundMap.get(fundId) ?? {
      fundId: row.fund_id,
      fundName: row.funds?.name ?? "Unassigned fund",
      contributionsCount: 0,
      totalAmountMinor: 0,
      succeededAmountMinor: 0,
    };

    current.contributionsCount += 1;
    if (row.status === "succeeded") {
      current.totalAmountMinor += row.amount_minor;
      current.succeededAmountMinor += row.amount_minor;
    }

    fundMap.set(fundId, current);
  }

  return Array.from(fundMap.values()).sort(
    (left, right) => right.totalAmountMinor - left.totalAmountMinor,
  );
}

export function getAdminTotalsByStatus(
  rows: AdminStatusTotalsRow[],
): AdminStatusSummaryItem[] {
  const statusMap = new Map<string, AdminStatusSummaryItem>();

  for (const row of rows) {
    const dashboardStatus = toDashboardStatusLabel(row.status);
    const current = statusMap.get(dashboardStatus) ?? {
      status: dashboardStatus,
      contributionsCount: 0,
      totalAmountMinor: 0,
    };

    current.contributionsCount += 1;
    current.totalAmountMinor += row.amount_minor;

    statusMap.set(dashboardStatus, current);
  }

  return Array.from(statusMap.values()).sort(
    (left, right) => getStatusSortOrder(left.status) - getStatusSortOrder(right.status),
  );
}

export async function getAdminDashboard(
  supabase: SupabaseClient,
  orgSlug: string,
): Promise<AdminDashboardData | null> {
  const organisation = await getAdminOrganisationBySlug(supabase, orgSlug);

  if (!organisation) {
    return null;
  }

  const [summaryRows, recentRows, fundRows, statusRows] = await Promise.all([
    listAdminSummaryRows(supabase, organisation.id),
    listAdminRecentContributionRows(supabase, organisation.id),
    listAdminFundTotalsRows(supabase, organisation.id),
    listAdminStatusTotalsRows(supabase, organisation.id),
  ]);

  return {
    organisationId: organisation.id,
    organisationName: organisation.name,
    organisationSlug: organisation.slug,
    currencyCode: organisation.currencyCode,
    activeSupportersCount: getActiveSupportersCount(summaryRows),
    summary: getAdminOverallSummary(summaryRows),
    recentContributions: getAdminRecentContributions(recentRows),
    fundBreakdown: getAdminTotalsByFund(fundRows),
    statusSummary: getAdminTotalsByStatus(statusRows),
  };
}
