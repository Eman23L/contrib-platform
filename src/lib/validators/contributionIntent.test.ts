import { describe, expect, it } from "vitest";

import { validateContributionIntentPayload } from "@/lib/validators/contributionIntent";

const basePayload = {
  organisationSlug: "grace-community",
  fundId: "fund-1",
  amount: 10,
};

describe("validateContributionIntentPayload", () => {
  it("accepts a valid guest payload with an email", () => {
    const result = validateContributionIntentPayload({
      ...basePayload,
      guestEmail: "Giver@Example.com",
    });

    expect(result.guestEmail).toBe("giver@example.com");
    expect(result.amountMinor).toBe(1000);
  });

  it("falls back to the authenticated user's email when no guestEmail is given", () => {
    const result = validateContributionIntentPayload(
      basePayload,
      "signed-in@example.com",
    );

    expect(result.guestEmail).toBe("signed-in@example.com");
  });

  it("rejects a request with no email at all (guest with no email field)", () => {
    expect(() => validateContributionIntentPayload(basePayload)).toThrow(
      "Email address is required for receipts and giving history.",
    );
  });

  it("rejects an invalid email", () => {
    expect(() =>
      validateContributionIntentPayload({
        ...basePayload,
        guestEmail: "not-an-email",
      }),
    ).toThrow("Enter a valid email address.");
  });

  it("rejects a missing organisation slug", () => {
    expect(() =>
      validateContributionIntentPayload(
        { ...basePayload, organisationSlug: "" },
        "giver@example.com",
      ),
    ).toThrow("Organisation slug is required.");
  });

  it("rejects a missing fund", () => {
    expect(() =>
      validateContributionIntentPayload(
        { ...basePayload, fundId: "" },
        "giver@example.com",
      ),
    ).toThrow("Fund selection is required.");
  });

  it("rejects a zero or negative amount", () => {
    expect(() =>
      validateContributionIntentPayload(
        { ...basePayload, amount: 0 },
        "giver@example.com",
      ),
    ).toThrow("Amount must be greater than zero.");
  });

  it("rejects an amount below the minimum after rounding", () => {
    expect(() =>
      validateContributionIntentPayload(
        { ...basePayload, amount: 0.4 },
        "giver@example.com",
      ),
    ).toThrow("Minimum contribution amount is 1.00.");
  });

  it("rejects an amount above the maximum", () => {
    expect(() =>
      validateContributionIntentPayload(
        { ...basePayload, amount: 2_000_000 },
        "giver@example.com",
      ),
    ).toThrow("Contribution amount is too large.");
  });

  it("rounds fractional amounts to the nearest penny in minor units", () => {
    const result = validateContributionIntentPayload(
      { ...basePayload, amount: 12.345 },
      "giver@example.com",
    );

    expect(result.amountMinor).toBe(1235);
  });

  it("rejects an overly long guest name", () => {
    expect(() =>
      validateContributionIntentPayload({
        ...basePayload,
        guestEmail: "giver@example.com",
        guestFirstName: "a".repeat(81),
      }),
    ).toThrow("First name must be 80 characters or fewer.");
  });

  it("combines first and last name into donorName", () => {
    const result = validateContributionIntentPayload({
      ...basePayload,
      guestEmail: "giver@example.com",
      guestFirstName: "Ada",
      guestLastName: "Lovelace",
    });

    expect(result.donorName).toBe("Ada Lovelace");
  });

  it("rejects a non-object payload", () => {
    expect(() => validateContributionIntentPayload(null)).toThrow(
      "Invalid request payload.",
    );
  });
});
