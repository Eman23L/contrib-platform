import type { CreateContributionIntentRequest } from "@/types/api";

export type ValidatedContributionIntentInput = {
  organisationSlug: string;
  fundId: string;
  amount: number;
  amountMinor: number;
  guestEmail: string;
  guestFirstName?: string;
  guestLastName?: string;
  donorName?: string;
};

function normalizeGuestEmail(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Email address is required for receipts and giving history.");
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    throw new Error("Email address is required for receipts and giving history.");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmed)) {
    throw new Error("Enter a valid email address.");
  }

  return trimmed;
}

function normalizeName(value: unknown, label: string): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > 80) {
    throw new Error(`${label} must be 80 characters or fewer.`);
  }

  return trimmed;
}

export function validateContributionIntentPayload(
  payload: unknown,
  fallbackEmail?: string | null,
): ValidatedContributionIntentInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid request payload.");
  }

  const candidate = payload as Partial<CreateContributionIntentRequest>;

  const organisationSlug =
    typeof candidate.organisationSlug === "string"
      ? candidate.organisationSlug.trim()
      : "";

  const fundId =
    typeof candidate.fundId === "string" ? candidate.fundId.trim() : "";

  const amount =
    typeof candidate.amount === "number"
      ? candidate.amount
      : Number(candidate.amount);

  if (!organisationSlug) {
    throw new Error("Organisation slug is required.");
  }

  if (!fundId) {
    throw new Error("Fund selection is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be greater than zero.");
  }

  const roundedAmount = Number(amount.toFixed(2));
  const amountMinor = Math.round(roundedAmount * 100);

  if (amountMinor < 100) {
    throw new Error("Minimum contribution amount is 1.00.");
  }

  if (amountMinor > 100_000_000) {
    throw new Error("Contribution amount is too large.");
  }

  const guestFirstName = normalizeName(candidate.guestFirstName, "First name");
  const guestLastName = normalizeName(candidate.guestLastName, "Last name");
  const donorName = [guestFirstName, guestLastName].filter(Boolean).join(" ") || undefined;

  return {
    organisationSlug,
    fundId,
    amount: roundedAmount,
    amountMinor,
    guestEmail: normalizeGuestEmail(candidate.guestEmail ?? fallbackEmail),
    guestFirstName,
    guestLastName,
    donorName,
  };
}
