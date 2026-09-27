import "server-only";

export type ValidatedFundForm = {
  description: string | null;
  fundId: string | null;
  isActive: boolean;
  isDefault: boolean;
  name: string;
};

type ValidationResult =
  | {
      ok: true;
      value: ValidatedFundForm;
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

export function validateFundForm(formData: FormData): ValidationResult {
  const fundIdInput = getFormString(formData, "fundId");
  const fundId = getOptionalUuid(fundIdInput);
  const name = getFormString(formData, "name");
  const description = getFormString(formData, "description");
  const isActive = getFormString(formData, "isActive") === "on";
  const isDefault = getFormString(formData, "isDefault") === "on";

  if (fundIdInput && !fundId) {
    return {
      error: "Invalid fund record.",
      ok: false,
    };
  }

  if (!name || name.length > 120) {
    return {
      error: "Fund name must be between 1 and 120 characters.",
      ok: false,
    };
  }

  if (!getFundSlug(name)) {
    return {
      error: "Fund name must include at least one letter or number.",
      ok: false,
    };
  }

  if (description.length > 500) {
    return {
      error: "Fund description must be 500 characters or fewer.",
      ok: false,
    };
  }

  return {
    ok: true,
    value: {
      description: description || null,
      fundId,
      isActive: isDefault ? true : isActive,
      isDefault,
      name,
    },
  };
}

export function getFundSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 80);
}
