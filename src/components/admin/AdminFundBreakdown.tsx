import type { AdminFundBreakdownItem } from "@/types/api";

type AdminFundBreakdownProps = {
  funds: AdminFundBreakdownItem[];
  formatAmount: (amountMinor: number) => string;
};

export function AdminFundBreakdown({
  funds,
  formatAmount,
}: AdminFundBreakdownProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
        Fund Breakdown
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Contribution performance by fund
      </h2>

      {funds.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-6 text-sm text-black/60">
          No fund activity is available yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {funds.map((fund) => (
            <article
              className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-4"
              key={fund.fundId ?? fund.fundName}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{fund.fundName}</h3>
                  <p className="mt-1 text-sm text-black/60">
                    {fund.contributionsCount} contribution
                    {fund.contributionsCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Total amount
                    </p>
                    <p className="mt-1 text-base font-semibold text-ink">
                      {formatAmount(fund.totalAmountMinor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                      Succeeded amount
                    </p>
                    <p className="mt-1 text-base font-semibold text-emerald-700">
                      {formatAmount(fund.succeededAmountMinor)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
