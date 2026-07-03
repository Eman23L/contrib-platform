import type { PublicFund } from "@/types/domain";

export type CreateContributionIntentRequest = {
  organisationSlug: string;
  fundId: string;
  amount: number;
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
};

export type CreateContributionIntentSuccessResponse = {
  ok: true;
  intentId: string;
  checkoutUrl: string;
  message: string;
};

export type CreateContributionIntentErrorResponse = {
  ok: false;
  error: string;
};

export type CreateContributionIntentResponse =
  | CreateContributionIntentSuccessResponse
  | CreateContributionIntentErrorResponse;

export type PublicGivingPageData = {
  organisationName: string;
  organisationSlug: string;
  currencyCode: string;
  funds: PublicFund[];
  publicSettings: {
    givingActionLabel: string;
    givingPageHeading: string;
    givingPageIntro: string;
    logoUrl: string;
    publicPageHeading: string;
    publicPageIntro: string;
    supportEmail: string;
    thankYouMessage: string;
  };
};

export type AdminSummary = {
  totalContributionsCount: number;
  totalContributedAmountMinor: number;
  totalSucceededAmountMinor: number;
};

export type AdminRecentContribution = {
  id: string;
  shortId: string;
  createdAt: string;
  organisationName: string;
  fundName: string | null;
  amountMinor: number;
  status: string;
  guestEmail: string | null;
  donorName: string | null;
};

export type AdminFundBreakdownItem = {
  fundId: string | null;
  fundName: string;
  description: string | null;
  contributionsCount: number;
  displayOrder: number | null;
  isActive: boolean | null;
  isDefault: boolean | null;
  totalAmountMinor: number;
  succeededAmountMinor: number;
  latestContributionAt: string | null;
};

export type AdminStatusSummaryItem = {
  status: string;
  contributionsCount: number;
  totalAmountMinor: number;
};

export type AdminSupporterSummaryItem = {
  averageGiftAmountMinor: number;
  displayName: string;
  email: string;
  firstGiftAt: string;
  giftsCount: number;
  lastGiftAt: string;
  latestStatus: string;
  totalGivenAmountMinor: number;
};

export type AdminCampaignSummaryItem = {
  campaignId: string | null;
  campaignName: string;
  description: string | null;
  endsAt: string | null;
  fundName: string | null;
  giftsCount: number;
  goalAmountMinor: number | null;
  isActive: boolean;
  latestContributionAt: string | null;
  startsAt: string | null;
  totalRaisedAmountMinor: number;
};

export type AdminGivingTrendItem = {
  label: string;
  monthKey: string;
  succeededAmountMinor: number;
  giftsCount: number;
};

export type AdminTeamMemberItem = {
  email: string | null;
  displayName: string | null;
  id: string;
  isActive: boolean;
  joinedAt: string;
  role: string;
  userId: string;
};

export type AdminOrganisationSettings = {
  currencyCode: string;
  legalName: string | null;
  name: string;
  publicSettings: PublicGivingPageData["publicSettings"];
  settings: Record<string, unknown>;
  slug: string;
  timezone: string;
};

export type AdminDashboardData = {
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  currencyCode: string;
  activeSupportersCount: number;
  campaignSummaries: AdminCampaignSummaryItem[];
  givingTrend: AdminGivingTrendItem[];
  summary: AdminSummary;
  recentContributions: AdminRecentContribution[];
  fundBreakdown: AdminFundBreakdownItem[];
  organisationSettings: AdminOrganisationSettings;
  statusSummary: AdminStatusSummaryItem[];
  supporterSummaries: AdminSupporterSummaryItem[];
  teamMembers: AdminTeamMemberItem[];
};

export type AdminContributionListItem = {
  id: string;
  shortId: string;
  createdAt: string;
  organisationName: string;
  fundName: string | null;
  amountMinor: number;
  currencyCode: string;
  status: string;
  guestEmail: string | null;
  donorName: string | null;
  paymentProvider: string;
  stripeCheckoutSessionId: string | null;
  paidAt: string | null;
};

export type AdminContributionFiltersData = {
  availableFunds: Array<{
    id: string;
    name: string;
  }>;
  organisationName: string;
  organisationSlug: string;
  selectedFundId: string;
  selectedStatus: string;
  startDate: string;
  endDate: string;
};

export type AdminContributionsPageData = {
  contributions: AdminContributionListItem[];
  filters: AdminContributionFiltersData;
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  summary: AdminSummary;
};
