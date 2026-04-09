export type Organisation = {
  id: string;
  name: string;
  slug: string;
  legalName: string | null;
  currencyCode: string;
  timezone: string;
  settings: Record<string, unknown>;
};

export type OrganisationRole = "owner" | "admin" | "finance" | "member";

export type OrganisationMembership = {
  id: string;
  organisationId: string;
  userId: string;
  role: OrganisationRole;
  isActive: boolean;
  organisationName: string;
  organisationSlug: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicFund = {
  id: string;
  organisationId: string;
  name: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  displayOrder: number;
};

export type ContributionIntent = {
  id: string;
  organisationId: string;
  fundId: string | null;
  campaignId: string | null;
  userId: string | null;
  amountMinor: number;
  currencyCode: string;
  status:
    | "draft"
    | "checkout_created"
    | "pending_payment"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "expired";
  paymentProvider: "stripe";
  guestEmail: string | null;
  donorName: string | null;
  donorNote: string | null;
  isAnonymous: boolean;
  source: "qr" | "web" | "admin";
  stripeCheckoutSessionId: string | null;
  checkoutUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};
