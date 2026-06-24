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
};

export type AdminStatusSummaryItem = {
  status: string;
  contributionsCount: number;
  totalAmountMinor: number;
};

export type AdminDashboardData = {
  organisationId: string;
  organisationName: string;
  organisationSlug: string;
  currencyCode: string;
  activeSupportersCount: number;
  summary: AdminSummary;
  recentContributions: AdminRecentContribution[];
  fundBreakdown: AdminFundBreakdownItem[];
  statusSummary: AdminStatusSummaryItem[];
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
