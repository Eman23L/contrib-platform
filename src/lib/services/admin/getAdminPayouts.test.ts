import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeSupabase } from "@/lib/services/testUtils/fakeSupabase";

const balanceRetrieve = vi.fn();
const payoutsList = vi.fn();
const balanceTransactionsList = vi.fn();

vi.mock("@/lib/stripe/server", () => ({
  getStripeServerClient: () => ({
    balance: { retrieve: balanceRetrieve },
    payouts: { list: payoutsList },
    balanceTransactions: { list: balanceTransactionsList },
  }),
}));

let fakeSupabase: FakeSupabase;

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseServiceClient: () => fakeSupabase,
}));

const { getAdminPayouts } = await import("@/lib/services/admin/getAdminPayouts");

beforeEach(() => {
  fakeSupabase = new FakeSupabase();
  balanceRetrieve.mockReset();
  payoutsList.mockReset();
  balanceTransactionsList.mockReset();

  balanceRetrieve.mockResolvedValue({
    available: [{ amount: 5000, currency: "gbp" }],
    pending: [{ amount: 1200, currency: "gbp" }],
  });
});

describe("getAdminPayouts", () => {
  it("reports available and pending balance", async () => {
    payoutsList.mockResolvedValue({ data: [] });

    const result = await getAdminPayouts();

    expect(result.availableBalanceMinor).toBe(5000);
    expect(result.pendingBalanceMinor).toBe(1200);
    expect(result.currencyCode).toBe("GBP");
    expect(result.payouts).toEqual([]);
  });

  it("matches a payout's charges against local payment records", async () => {
    fakeSupabase.seed("payments", [
      { id: "p1", stripe_charge_id: "ch_1", amount_minor: 1000 },
      { id: "p2", stripe_charge_id: "ch_2", amount_minor: 2000 },
    ]);

    payoutsList.mockResolvedValue({
      data: [
        {
          id: "po_1",
          amount: 3000,
          currency: "gbp",
          status: "paid",
          method: "standard",
          arrival_date: 1_700_000_000,
          created: 1_699_900_000,
        },
      ],
    });

    balanceTransactionsList.mockResolvedValue({
      data: [
        { source: "ch_1" },
        { source: "ch_2" },
      ],
    });

    const result = await getAdminPayouts();

    expect(result.payouts).toHaveLength(1);
    const [payout] = result.payouts;
    expect(payout.reconciled).toBe(true);
    expect(payout.matchedChargeCount).toBe(2);
    expect(payout.matchedAmountMinor).toBe(3000);
    expect(payout.unmatchedChargeCount).toBe(0);
  });

  it("flags charges in a Stripe payout that have no matching local payment record", async () => {
    fakeSupabase.seed("payments", [
      { id: "p1", stripe_charge_id: "ch_1", amount_minor: 1000 },
    ]);

    payoutsList.mockResolvedValue({
      data: [
        {
          id: "po_1",
          amount: 3000,
          currency: "gbp",
          status: "paid",
          method: "standard",
          arrival_date: 1_700_000_000,
          created: 1_699_900_000,
        },
      ],
    });

    balanceTransactionsList.mockResolvedValue({
      data: [{ source: "ch_1" }, { source: "ch_missing" }],
    });

    const result = await getAdminPayouts();

    const [payout] = result.payouts;
    expect(payout.matchedChargeCount).toBe(1);
    expect(payout.unmatchedChargeCount).toBe(1);
  });

  it("does not reconcile payouts beyond the recent-payout limit", async () => {
    const manyPayouts = Array.from({ length: 8 }, (_, index) => ({
      id: `po_${index}`,
      amount: 1000,
      currency: "gbp",
      status: "paid",
      method: "standard",
      arrival_date: 1_700_000_000,
      created: 1_699_900_000,
    }));
    payoutsList.mockResolvedValue({ data: manyPayouts });
    balanceTransactionsList.mockResolvedValue({ data: [] });

    const result = await getAdminPayouts();

    const reconciledCount = result.payouts.filter((payout) => payout.reconciled).length;
    const unreconciledCount = result.payouts.filter((payout) => !payout.reconciled).length;

    expect(reconciledCount).toBe(5);
    expect(unreconciledCount).toBe(3);
  });
});
