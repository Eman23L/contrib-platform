import type Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";

export type AdminPayoutItem = {
  id: string;
  amountMinor: number;
  currencyCode: string;
  status: string;
  method: string;
  arrivalDate: string;
  createdAt: string;
  matchedChargeCount: number;
  matchedAmountMinor: number;
  unmatchedChargeCount: number;
  reconciled: boolean;
};

export type AdminPayoutsData = {
  availableBalanceMinor: number;
  pendingBalanceMinor: number;
  currencyCode: string;
  payouts: AdminPayoutItem[];
};

// Reconciling every historical payout against Stripe's balance transactions
// gets expensive fast, so only the most recent payouts are matched against
// local payment records; older ones are listed without a match count.
const PAYOUT_LIST_LIMIT = 15;
const RECONCILED_PAYOUT_LIMIT = 5;

function getBalanceTransactionSourceId(source: Stripe.BalanceTransaction["source"]) {
  if (!source) {
    return null;
  }

  return typeof source === "string" ? source : source.id;
}

async function matchPayoutCharges(
  stripe: Stripe,
  payoutId: string,
): Promise<{ matched: number; matchedAmountMinor: number; unmatched: number }> {
  const balanceTransactions = await stripe.balanceTransactions.list({
    payout: payoutId,
    type: "charge",
    limit: 100,
  });

  const chargeIds = balanceTransactions.data
    .map((transaction) => getBalanceTransactionSourceId(transaction.source))
    .filter((id): id is string => Boolean(id));

  if (chargeIds.length === 0) {
    return { matched: 0, matchedAmountMinor: 0, unmatched: 0 };
  }

  const supabase = createServerSupabaseServiceClient();
  const { data, error } = await supabase
    .from("payments")
    .select("amount_minor")
    .in("stripe_charge_id", chargeIds)
    .returns<Array<{ amount_minor: number }>>();

  if (error) {
    throw new Error(`Failed to match payments to payout: ${error.message}`);
  }

  const matched = data.length;
  const matchedAmountMinor = data.reduce((sum, row) => sum + row.amount_minor, 0);

  return { matched, matchedAmountMinor, unmatched: chargeIds.length - matched };
}

function toPayoutItem(
  payout: Stripe.Payout,
  match: { matched: number; matchedAmountMinor: number; unmatched: number } | null,
): AdminPayoutItem {
  return {
    id: payout.id,
    amountMinor: payout.amount,
    currencyCode: payout.currency.toUpperCase(),
    status: payout.status,
    method: payout.method,
    arrivalDate: new Date(payout.arrival_date * 1000).toISOString(),
    createdAt: new Date(payout.created * 1000).toISOString(),
    matchedChargeCount: match?.matched ?? 0,
    matchedAmountMinor: match?.matchedAmountMinor ?? 0,
    unmatchedChargeCount: match?.unmatched ?? 0,
    reconciled: match !== null,
  };
}

export async function getAdminPayouts(): Promise<AdminPayoutsData> {
  const stripe = getStripeServerClient();

  const [balance, payoutList] = await Promise.all([
    stripe.balance.retrieve(),
    stripe.payouts.list({ limit: PAYOUT_LIST_LIMIT }),
  ]);

  const payouts = await Promise.all(
    payoutList.data.map(async (payout, index) => {
      if (index >= RECONCILED_PAYOUT_LIMIT) {
        return toPayoutItem(payout, null);
      }

      const match = await matchPayoutCharges(stripe, payout.id);
      return toPayoutItem(payout, match);
    }),
  );

  const availableBalance = balance.available[0];
  const pendingBalance = balance.pending[0];

  return {
    availableBalanceMinor: availableBalance?.amount ?? 0,
    pendingBalanceMinor: pendingBalance?.amount ?? 0,
    currencyCode: (availableBalance?.currency ?? pendingBalance?.currency ?? "gbp").toUpperCase(),
    payouts,
  };
}
