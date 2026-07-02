import "server-only";

import type { OrganisationPublicSettings } from "@/lib/organisationSettings";

export type ValidatedOrganisationSettings = {
  legalName: string | null;
  name: string;
  publicSettings: OrganisationPublicSettings;
  slug: string;
  timezone: string;
};

type ValidationResult =
  | {
      ok: true;
      value: ValidatedOrganisationSettings;
    }
  | {
      error: string;
      ok: false;
    };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: string, maxLength: number) {
  if (!value) {
    return "";
  }

  return value.slice(0, maxLength);
}

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isValidOptionalUrl(value: string) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateOrganisationSettingsForm(formData: FormData): ValidationResult {
  const name = getFormString(formData, "name");
  const legalName = getFormString(formData, "legalName");
  const slug = getFormString(formData, "slug").toLowerCase();
  const timezone = getFormString(formData, "timezone");
  const supportEmail = getFormString(formData, "supportEmail").toLowerCase();
  const logoUrl = getFormString(formData, "logoUrl");

  if (!name || name.length > 120) {
    return {
      error: "Organisation display name must be between 1 and 120 characters.",
      ok: false,
    };
  }

  if (legalName.length > 160) {
    return {
      error: "Legal name must be 160 characters or fewer.",
      ok: false,
    };
  }

  if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    return {
      error: "Organisation slug must use lowercase letters, numbers, and single hyphens.",
      ok: false,
    };
  }

  if (!timezone || timezone.length > 80 || !isValidTimezone(timezone)) {
    return {
      error: "Enter a valid timezone, for example Europe/London.",
      ok: false,
    };
  }

  if (supportEmail && (supportEmail.length > 254 || !EMAIL_PATTERN.test(supportEmail))) {
    return {
      error: "Enter a valid support email address or leave it blank.",
      ok: false,
    };
  }

  if (!isValidOptionalUrl(logoUrl)) {
    return {
      error: "Logo URL must be a valid http or https URL.",
      ok: false,
    };
  }

  return {
    ok: true,
    value: {
      legalName: legalName || null,
      name,
      publicSettings: {
        givingActionLabel: optionalText(getFormString(formData, "givingActionLabel"), 80) || "Give",
        givingPageHeading: optionalText(getFormString(formData, "givingPageHeading"), 140),
        givingPageIntro: optionalText(getFormString(formData, "givingPageIntro"), 500),
        logoUrl: optionalText(logoUrl, 500),
        publicPageHeading: optionalText(getFormString(formData, "publicPageHeading"), 140),
        publicPageIntro: optionalText(getFormString(formData, "publicPageIntro"), 500),
        supportEmail,
        thankYouMessage: optionalText(getFormString(formData, "thankYouMessage"), 500),
      },
      slug,
      timezone,
    },
  };
}
