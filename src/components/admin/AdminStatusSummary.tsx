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
    <section className="gf-card p-5 sm:p-6">
      <p className="gf-kicker">
        Status summary
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        Payment snapshot
      </h2>

      {statuses.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No payment statuses are available yet.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {statuses.map((statusItem) => (
            <article
              className={`rounded-2xl border px-4 py-4 ${getStatusAccent(statusItem.status)}`}
              key={statusItem.status}
            >
              <p className="text-sm font-semibold">
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
