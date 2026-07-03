import "server-only";

export type ValidatedCampaignForm = {
  campaignId: string | null;
  description: string | null;
  endsAt: string | null;
  fundId: string;
  goalAmountMinor: number | null;
  isActive: boolean;
  name: string;
  startsAt: string | null;
};

type ValidationResult =
  | {
      ok: true;
      value: ValidatedCampaignForm;
    }
  | {
      error: string;
      ok: false;
    };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getOptionalUuid(value: string) {
  if (!value) {
    return null;
  }

  return UUID_PATTERN.test(value) ? value : null;
}

function getDateValue(value: string) {
  if (!value) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : null;
}

function parseAmountMinor(value: string) {
  if (!value) {
    return null;
  }

  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return Number.NaN;
  }

  const [pounds, pence = ""] = value.split(".");
  return Number(pounds) * 100 + Number(pence.padEnd(2, "0"));
}

export function validateCampaignForm(formData: FormData): ValidationResult {
  const campaignIdInput = getFormString(formData, "campaignId");
  const campaignId = getOptionalUuid(campaignIdInput);
  const fundId = getOptionalUuid(getFormString(formData, "fundId"));
  const name = getFormString(formData, "name");
  const description = getFormString(formData, "description");
  const goalAmountMinor = parseAmountMinor(getFormString(formData, "goalAmount"));
  const startsAt = getDateValue(getFormString(formData, "startsAt"));
  const endsAt = getDateValue(getFormString(formData, "endsAt"));
  const isActive = getFormString(formData, "isActive") === "on";

  if (campaignIdInput && !campaignId) {
    return {
      error: "Invalid campaign record.",
      ok: false,
    };
  }

  if (!fundId) {
    return {
      error: "Choose a fund for this campaign.",
      ok: false,
    };
  }

  if (!name || name.length > 120) {
    return {
      error: "Campaign name must be between 1 and 120 characters.",
      ok: false,
    };
  }

  if (!getCampaignSlug(name)) {
    return {
      error: "Campaign name must include at least one letter or number.",
      ok: false,
    };
  }

  if (description.length > 500) {
    return {
      error: "Campaign description must be 500 characters or fewer.",
      ok: false,
    };
  }

  if (Number.isNaN(goalAmountMinor) || (goalAmountMinor !== null && goalAmountMinor <= 0)) {
    return {
      error: "Campaign goal must be a positive amount or blank.",
      ok: false,
    };
  }

  if (getFormString(formData, "startsAt") && !startsAt) {
    return {
      error: "Enter a valid campaign start date.",
      ok: false,
    };
  }

  if (getFormString(formData, "endsAt") && !endsAt) {
    return {
      error: "Enter a valid campaign end date.",
      ok: false,
    };
  }

  if (startsAt && endsAt && endsAt < startsAt) {
    return {
      error: "Campaign end date must be after the start date.",
      ok: false,
    };
  }

  return {
    ok: true,
    value: {
      campaignId,
      description: description || null,
      endsAt,
      fundId,
      goalAmountMinor,
      isActive,
      name,
      startsAt,
    },
  };
}

export function getCampaignSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 80);
}
