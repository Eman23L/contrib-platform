import type { AdminPayoutItem } from "@/lib/services/admin/getAdminPayouts";

type AdminPayoutsTableProps = {
  payouts: AdminPayoutItem[];
  formatAmount: (amountMinor: number, currencyCode: string) => string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getStatusClasses(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-100 text-emerald-800";
    case "failed":
    case "canceled":
      return "bg-red-100 text-red-700";
    case "pending":
    case "in_transit":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "in_transit":
      return "In transit";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function AdminPayoutsTable({ payouts, formatAmount }: AdminPayoutsTableProps) {
  return (
    <section className="gf-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="gf-kicker">Bank payouts</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Recent Stripe payouts
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            All organisations currently share one Stripe account and one bank
            payout schedule. The most recent payouts are matched against this
            app&apos;s own payment records below.
          </p>
        </div>
        <p className="text-sm text-slate-500">{payouts.length} shown</p>
      </div>

      {payouts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No payouts have been made from Stripe yet.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4 lg:hidden">
            {payouts.map((payout) => (
              <article
                className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4"
                key={payout.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-semibold text-slate-950">
                    {formatAmount(payout.amountMinor, payout.currencyCode)}
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(payout.status)}`}
                  >
                    {getStatusLabel(payout.status)}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  <p>Arrives {formatDate(payout.arrivalDate)}</p>
                  <p>Method: {payout.method}</p>
                  {payout.reconciled ? (
                    <p className={payout.unmatchedChargeCount > 0 ? "font-semibold text-amber-700" : ""}>
                      {payout.matchedChargeCount} matched gift(s), {formatAmount(payout.matchedAmountMinor, payout.currencyCode)}
                      {payout.unmatchedChargeCount > 0
                        ? ` — ${payout.unmatchedChargeCount} charge(s) not found in this app's records`
                        : ""}
                    </p>
                  ) : (
                    <p className="text-slate-400">Not reconciled (older payout)</p>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500">
                  <th className="pb-1 pr-4">Arrives</th>
                  <th className="pb-1 pr-4">Amount</th>
                  <th className="pb-1 pr-4">Status</th>
                  <th className="pb-1 pr-4">Method</th>
                  <th className="pb-1 pr-4">Reconciliation</th>
                  <th className="pb-1">Payout ID</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr className="bg-black/[0.025]" key={payout.id}>
                    <td className="rounded-l-2xl px-4 py-4 text-sm text-black/70">
                      {formatDate(payout.arrivalDate)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-ink">
                      {formatAmount(payout.amountMinor, payout.currencyCode)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(payout.status)}`}
                      >
                        {getStatusLabel(payout.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">{payout.method}</td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {payout.reconciled ? (
                        <span className={payout.unmatchedChargeCount > 0 ? "font-semibold text-amber-700" : ""}>
                          {payout.matchedChargeCount} matched, {formatAmount(payout.matchedAmountMinor, payout.currencyCode)}
                          {payout.unmatchedChargeCount > 0
                            ? ` (${payout.unmatchedChargeCount} unmatched)`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not reconciled</span>
                      )}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 font-mono text-xs text-black/55">
                      {payout.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
