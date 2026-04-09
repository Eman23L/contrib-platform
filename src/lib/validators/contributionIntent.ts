import type { CreateContributionIntentRequest } from "@/types/api";

export type ValidatedContributionIntentInput = {
  organisationSlug: string;
  fundId: string;
  amount: number;
  amountMinor: number;
  guestEmail?: string;
};

function normalizeGuestEmail(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return undefined;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmed)) {
    throw new Error("Enter a valid email address or leave it blank.");
  }

  return trimmed;
}

export function validateContributionIntentPayload(
  payload: unknown,
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

  return {
    organisationSlug,
    fundId,
    amount: roundedAmount,
    amountMinor,
    guestEmail: normalizeGuestEmail(candidate.guestEmail),
  };
}
