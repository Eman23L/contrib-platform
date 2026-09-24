import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeSupabase } from "@/lib/services/testUtils/fakeSupabase";

let fakeSupabase: FakeSupabase;

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseServiceClient: () => fakeSupabase,
}));

const { getContributionBySessionId } = await import(
  "@/lib/services/public/getContributionBySessionId"
);

beforeEach(() => {
  fakeSupabase = new FakeSupabase();
});

describe("getContributionBySessionId", () => {
  it("returns null for a blank session id", async () => {
    const result = await getContributionBySessionId("   ");
    expect(result).toBeNull();
  });

  it("returns a one-time contribution intent when one matches the session", async () => {
    fakeSupabase.seed("contribution_intents", [
      {
        id: "intent-1",
        organisation_id: "org-1",
        fund_id: "fund-1",
        campaign_id: null,
        user_id: null,
        amount_minor: 1500,
        currency_code: "GBP",
        status: "succeeded",
        payment_provider: "stripe",
        guest_email: "giver@example.com",
        donor_name: null,
        donor_note: null,
        is_anonymous: false,
        source: "web",
        stripe_checkout_session_id: "cs_one_time_1",
        checkout_url: null,
        expires_at: null,
        paid_at: "2024-01-01T00:00:00.000Z",
        recurring_plan_id: null,
        created_at: "2024-01-01T00:00:00.000Z",
        updated_at: "2024-01-01T00:00:00.000Z",
        organisations: { name: "Grace Community", slug: "grace-community" },
        funds: { name: "Tithe" },
      },
    ]);

    const result = await getContributionBySessionId("cs_one_time_1");

    expect(result).toMatchObject({
      id: "intent-1",
      amountMinor: 1500,
      status: "succeeded",
      organisationName: "Grace Community",
    });
  });

  it("falls back to a recurring plan when no contribution intent matches the session", async () => {
    fakeSupabase.seed("contribution_intents", []);
    fakeSupabase.seed("recurring_plans", [
      {
        id: "plan-1",
        organisation_id: "org-1",
        fund_id: "fund-1",
        user_id: "user-1",
        amount_minor: 2000,
        currency_code: "GBP",
        donor_name: "Ada Lovelace",
        stripe_checkout_session_id: "cs_sub_1",
        created_at: "2024-01-01T00:00:00.000Z",
        organisations: { name: "Grace Community", slug: "grace-community" },
        funds: { name: "Building Fund" },
      },
    ]);

    const result = await getContributionBySessionId("cs_sub_1");

    expect(result).toMatchObject({
      id: "plan-1",
      amountMinor: 2000,
      status: "succeeded",
      source: "recurring",
      organisationName: "Grace Community",
      fundName: "Building Fund",
    });
  });

  it("returns null when neither a contribution intent nor a recurring plan matches", async () => {
    const result = await getContributionBySessionId("cs_unknown");
    expect(result).toBeNull();
  });
});
