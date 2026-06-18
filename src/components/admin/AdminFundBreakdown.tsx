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
    <section className="gf-card p-5 sm:p-6">
      <p className="gf-kicker">
        Fund breakdown
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        Giving by fund
      </h2>

      {funds.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No fund activity is available yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {funds.map((fund) => (
            <article
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 px-4 py-4"
              key={fund.fundId ?? fund.fundName}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{fund.fundName}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {fund.contributionsCount} gift
                    {fund.contributionsCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-[#5f7f66]">
                      Total
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950">
                      {formatAmount(fund.totalAmountMinor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#5f7f66]">
                      Completed
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
