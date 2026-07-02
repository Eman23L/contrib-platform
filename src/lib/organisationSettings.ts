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

export function getDefaultOrganisationPublicSettings(
  organisationName: string,
): OrganisationPublicSettings {
  return {
    givingActionLabel: "Give",
    givingPageHeading: `Support ${organisationName}`,
    givingPageIntro: "Choose a fund, select an amount, and continue to secure checkout.",
    logoUrl: "",
    publicPageHeading: `Welcome to ${organisationName}`,
    publicPageIntro: "Sign in to view your giving history or continue as a guest.",
    supportEmail: "",
    thankYouMessage:
      "Your payment was completed successfully and recorded for the fund you selected.",
  };
}

function getStringSetting(settings: Record<string, unknown>, key: string) {
  const value = settings[key];

  return typeof value === "string" ? value.trim() : "";
}

export function getOrganisationPublicSettings(
  settings: Record<string, unknown>,
  organisationName: string,
): OrganisationPublicSettings {
  const defaults = getDefaultOrganisationPublicSettings(organisationName);

  return {
    givingActionLabel:
      getStringSetting(settings, "givingActionLabel") ||
      defaults.givingActionLabel,
    givingPageHeading:
      getStringSetting(settings, "givingPageHeading") ||
      defaults.givingPageHeading,
    givingPageIntro:
      getStringSetting(settings, "givingPageIntro") ||
      defaults.givingPageIntro,
    logoUrl: getStringSetting(settings, "logoUrl"),
    publicPageHeading:
      getStringSetting(settings, "publicPageHeading") ||
      defaults.publicPageHeading,
    publicPageIntro:
      getStringSetting(settings, "publicPageIntro") ||
      defaults.publicPageIntro,
    supportEmail: getStringSetting(settings, "supportEmail"),
    thankYouMessage:
      getStringSetting(settings, "thankYouMessage") ||
      defaults.thankYouMessage,
  };
}
