import "server-only";

export type OrganisationPublicSettings = {
  givingActionLabel: string;
  givingPageHeading: string;
  givingPageIntro: string;
  logoUrl: string;
  publicPageHeading: string;
  publicPageIntro: string;
  supportEmail: string;
  thankYouMessage: string;
};

export const ORGANISATION_PUBLIC_SETTING_KEYS = [
  "givingActionLabel",
  "givingPageHeading",
  "givingPageIntro",
  "logoUrl",
  "publicPageHeading",
  "publicPageIntro",
  "supportEmail",
  "thankYouMessage",
] as const;

function getStringSetting(settings: Record<string, unknown>, key: string) {
  const value = settings[key];

  return typeof value === "string" ? value.trim() : "";
}

export function getOrganisationPublicSettings(
  settings: Record<string, unknown>,
  organisationName: string,
): OrganisationPublicSettings {
  return {
    givingActionLabel: getStringSetting(settings, "givingActionLabel") || "Give",
    givingPageHeading:
      getStringSetting(settings, "givingPageHeading") ||
      `Support ${organisationName}`,
    givingPageIntro:
      getStringSetting(settings, "givingPageIntro") ||
      "Choose a fund, select an amount, and continue to secure checkout.",
    logoUrl: getStringSetting(settings, "logoUrl"),
    publicPageHeading:
      getStringSetting(settings, "publicPageHeading") ||
      `Welcome to ${organisationName}`,
    publicPageIntro:
      getStringSetting(settings, "publicPageIntro") ||
      "Sign in to view your giving history or continue as a guest.",
    supportEmail: getStringSetting(settings, "supportEmail"),
    thankYouMessage:
      getStringSetting(settings, "thankYouMessage") ||
      "Your payment was completed successfully and recorded for the fund you selected.",
  };
}
