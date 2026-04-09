import type { AdminStatusSummaryItem } from "@/types/api";

type AdminStatusSummaryProps = {
  statuses: AdminStatusSummaryItem[];
  formatAmount: (amountMinor: number) => string;
};

function getStatusAccent(status: string) {
  switch (status) {
    case "succeeded":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "failed":
      return "bg-red-50 border-red-200 text-red-700";
    case "checkout_created":
      return "bg-amber-50 border-amber-200 text-amber-800";
    default:
      return "bg-slate-50 border-slate-200 text-slate-700";
  }
}

export function AdminStatusSummary({
  statuses,
  formatAmount,
}: AdminStatusSummaryProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
        Status Summary
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        Contribution lifecycle snapshot
      </h2>

      {statuses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-6 text-sm text-black/60">
          No contribution statuses are available yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {statuses.map((statusItem) => (
            <article
              className={`rounded-2xl border px-4 py-4 ${getStatusAccent(statusItem.status)}`}
              key={statusItem.status}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                {statusItem.status}
              </p>
              <p className="mt-3 text-2xl font-semibold">{statusItem.contributionsCount}</p>
              <p className="mt-2 text-sm font-medium">
                {formatAmount(statusItem.totalAmountMinor)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
