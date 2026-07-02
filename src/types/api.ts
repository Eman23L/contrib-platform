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
  contributionsCount: number;
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
  displayName: string;
  email: string;
  giftsCount: number;
  lastGiftAt: string;
  latestStatus: string;
  totalGivenAmountMinor: number;
};

export type AdminCampaignSummaryItem = {
  campaignId: string | null;
  campaignName: string;
  fundName: string | null;
  giftsCount: number;
  latestContributionAt: string | null;
  totalRaisedAmountMinor: number;
};

export type AdminTeamMemberItem = {
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
