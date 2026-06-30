import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getAdminOrganisationBySlug,
  listAdminCampaignRows,
  listAdminFundTotalsRows,
  listAdminRecentContributionRows,
  listAdminSectionContributionRows,
  listAdminStatusTotalsRows,
  listAdminSummaryRows,
  listAdminTeamMemberRows,
  type AdminCampaignRow,
  type AdminFundTotalsRow,
  type AdminSectionContributionRow,
  type AdminStatusTotalsRow,
  type AdminTeamMemberRow,
} from "@/lib/db/queries/admin";
import type {
  AdminCampaignSummaryItem,
  AdminDashboardData,
  AdminFundBreakdownItem,
  AdminOrganisationSettings,
  AdminRecentContribution,
  AdminStatusSummaryItem,
  AdminSummary,
  AdminSupporterSummaryItem,
  AdminTeamMemberItem,
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

function isPaidStatus(status: ContributionIntent["status"]) {
  return status === "succeeded";
}

export function getAdminOverallSummary(
  rows: Array<{ amount_minor: number; status: ContributionIntent["status"] }>,
): AdminSummary {
  return rows.reduce<AdminSummary>(
    (summary, row) => {
      summary.totalContributionsCount += 1;

      if (isPaidStatus(row.status)) {
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
      latestContributionAt: null,
      totalAmountMinor: 0,
      succeededAmountMinor: 0,
    };

    current.contributionsCount += 1;
    if (isPaidStatus(row.status)) {
      current.totalAmountMinor += row.amount_minor;
      current.succeededAmountMinor += row.amount_minor;
    }

    if (
      !current.latestContributionAt ||
      row.created_at > current.latestContributionAt
    ) {
      current.latestContributionAt = row.created_at;
    }

    fundMap.set(fundId, current);
  }

  return Array.from(fundMap.values()).sort(
    (left, right) => right.totalAmountMinor - left.totalAmountMinor,
  );
}

export function getAdminSupporterSummaries(
  rows: AdminSectionContributionRow[],
): AdminSupporterSummaryItem[] {
  const supporterMap = new Map<string, AdminSupporterSummaryItem>();

  for (const row of rows) {
    const email = row.guest_email?.trim().toLowerCase();

    if (!email) {
      continue;
    }

    const current = supporterMap.get(email) ?? {
      displayName: row.donor_name?.trim() || email,
      email,
      giftsCount: 0,
      lastGiftAt: row.created_at,
      latestStatus: row.status,
      totalGivenAmountMinor: 0,
    };

    current.giftsCount += 1;

    if (isPaidStatus(row.status)) {
      current.totalGivenAmountMinor += row.amount_minor;
    }

    if (row.created_at >= current.lastGiftAt) {
      current.lastGiftAt = row.created_at;
      current.latestStatus = row.status;

      if (row.donor_name?.trim()) {
        current.displayName = row.donor_name.trim();
      }
    }

    supporterMap.set(email, current);
  }

  return Array.from(supporterMap.values()).sort(
    (left, right) => right.lastGiftAt.localeCompare(left.lastGiftAt),
  );
}

export function getAdminCampaignSummaries(
  campaignRows: AdminCampaignRow[],
  contributionRows: AdminSectionContributionRow[],
  fundRows: AdminFundTotalsRow[],
): AdminCampaignSummaryItem[] {
  const campaignMap = new Map<string, AdminCampaignSummaryItem>();

  for (const campaign of campaignRows) {
    campaignMap.set(campaign.id, {
      campaignId: campaign.id,
      campaignName: campaign.name,
      fundName: campaign.funds?.name ?? null,
      giftsCount: 0,
      latestContributionAt: null,
      totalRaisedAmountMinor: 0,
    });
  }

  for (const row of contributionRows) {
    if (!row.campaign_id) {
      continue;
    }

    const current = campaignMap.get(row.campaign_id);

    if (!current) {
      continue;
    }

    current.giftsCount += 1;

    if (isPaidStatus(row.status)) {
      current.totalRaisedAmountMinor += row.amount_minor;
    }

    if (
      !current.latestContributionAt ||
      row.created_at > current.latestContributionAt
    ) {
      current.latestContributionAt = row.created_at;
    }
  }

  if (campaignMap.size > 0) {
    return Array.from(campaignMap.values()).sort(
      (left, right) => right.totalRaisedAmountMinor - left.totalRaisedAmountMinor,
    );
  }

  const fundMap = new Map<string, AdminCampaignSummaryItem>();

  for (const row of fundRows) {
    const key = row.fund_id ?? row.funds?.name ?? "unassigned";
    const current = fundMap.get(key) ?? {
      campaignId: row.fund_id,
      campaignName: row.funds?.name ?? "Unassigned fund",
      fundName: row.funds?.name ?? null,
      giftsCount: 0,
      latestContributionAt: null,
      totalRaisedAmountMinor: 0,
    };

    current.giftsCount += 1;

    if (isPaidStatus(row.status)) {
      current.totalRaisedAmountMinor += row.amount_minor;
    }

    if (
      !current.latestContributionAt ||
      row.created_at > current.latestContributionAt
    ) {
      current.latestContributionAt = row.created_at;
    }

    fundMap.set(key, current);
  }

  return Array.from(fundMap.values()).sort(
    (left, right) => right.totalRaisedAmountMinor - left.totalRaisedAmountMinor,
  );
}

export function getAdminTeamMembers(
  rows: AdminTeamMemberRow[],
): AdminTeamMemberItem[] {
  return rows.map((row) => ({
    id: row.id,
    isActive: row.is_active,
    joinedAt: row.created_at,
    role: row.role,
    userId: row.user_id,
  }));
}

function getOrganisationSettings(
  organisation: NonNullable<Awaited<ReturnType<typeof getAdminOrganisationBySlug>>>,
): AdminOrganisationSettings {
  return {
    currencyCode: organisation.currencyCode,
    legalName: organisation.legalName,
    name: organisation.name,
    settings: organisation.settings,
    slug: organisation.slug,
    timezone: organisation.timezone,
  };
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

  const [
    summaryRows,
    recentRows,
    fundRows,
    statusRows,
    sectionContributionRows,
    campaignRows,
    teamRows,
  ] = await Promise.all([
    listAdminSummaryRows(supabase, organisation.id),
    listAdminRecentContributionRows(supabase, organisation.id),
    listAdminFundTotalsRows(supabase, organisation.id),
    listAdminStatusTotalsRows(supabase, organisation.id),
    listAdminSectionContributionRows(supabase, organisation.id),
    listAdminCampaignRows(supabase, organisation.id),
    listAdminTeamMemberRows(supabase, organisation.id),
  ]);

  return {
    organisationId: organisation.id,
    organisationName: organisation.name,
    organisationSlug: organisation.slug,
    currencyCode: organisation.currencyCode,
    activeSupportersCount: getActiveSupportersCount(summaryRows),
    campaignSummaries: getAdminCampaignSummaries(campaignRows, sectionContributionRows, fundRows),
    summary: getAdminOverallSummary(summaryRows),
    recentContributions: getAdminRecentContributions(recentRows),
    fundBreakdown: getAdminTotalsByFund(fundRows),
    organisationSettings: getOrganisationSettings(organisation),
    statusSummary: getAdminTotalsByStatus(statusRows),
    supporterSummaries: getAdminSupporterSummaries(sectionContributionRows),
    teamMembers: getAdminTeamMembers(teamRows),
  };
}
