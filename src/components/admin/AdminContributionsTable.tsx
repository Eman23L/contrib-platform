import type { AdminContributionListItem } from "@/types/api";

type AdminContributionsTableProps = {
  contributions: AdminContributionListItem[];
  formatAmount: (amountMinor: number, currencyCode: string) => string;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClasses(status: string) {
  switch (status) {
    case "succeeded":
      return "bg-emerald-100 text-emerald-800";
    case "failed":
      return "bg-red-100 text-red-700";
    case "checkout_created":
      return "bg-amber-100 text-amber-800";
    case "created":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-black/8 text-black/65";
  }
}

export function AdminContributionsTable({
  contributions,
  formatAmount,
}: AdminContributionsTableProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Contributions
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Detailed payment activity
          </h2>
        </div>
        <p className="text-sm text-black/55">{contributions.length} records</p>
      </div>

      {contributions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-6 text-sm text-black/60">
          No contributions matched the current filters.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4 lg:hidden">
            {contributions.map((contribution) => (
              <article
                className="rounded-2xl border border-black/8 bg-white px-4 py-4"
                key={contribution.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-ink">
                      {formatAmount(contribution.amountMinor, contribution.currencyCode)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-black/55">
                      {contribution.shortId}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contribution.status)}`}
                  >
                    {contribution.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-black/65">
                  <p>{formatDateTime(contribution.createdAt)}</p>
                  <p>{contribution.organisationName}</p>
                  <p>{contribution.fundName ?? "Unassigned fund"}</p>
                  <p>{contribution.guestEmail ?? "No email recorded"}</p>
                  <p>Provider: {contribution.paymentProvider}</p>
                  <p>
                    Stripe session: {contribution.stripeCheckoutSessionId ?? "Not recorded"}
                  </p>
                  <p>Paid at: {formatDateTime(contribution.paidAt)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                  <th className="pb-1 pr-4">Created</th>
                  <th className="pb-1 pr-4">Contribution</th>
                  <th className="pb-1 pr-4">Organisation</th>
                  <th className="pb-1 pr-4">Fund</th>
                  <th className="pb-1 pr-4">Amount</th>
                  <th className="pb-1 pr-4">Status</th>
                  <th className="pb-1 pr-4">Email</th>
                  <th className="pb-1 pr-4">Provider</th>
                  <th className="pb-1 pr-4">Stripe Session</th>
                  <th className="pb-1">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr className="bg-black/[0.025]" key={contribution.id}>
                    <td className="rounded-l-2xl px-4 py-4 text-sm text-black/70">
                      {formatDateTime(contribution.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-ink">{contribution.shortId}</div>
                      <div className="mt-1 font-mono text-xs text-black/55">
                        {contribution.id}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink">
                      {contribution.organisationName}
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {contribution.fundName ?? "Unassigned fund"}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-ink">
                      {formatAmount(contribution.amountMinor, contribution.currencyCode)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contribution.status)}`}
                      >
                        {contribution.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {contribution.guestEmail ?? "No email recorded"}
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {contribution.paymentProvider}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-black/55">
                      {contribution.stripeCheckoutSessionId ?? "Not recorded"}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 text-sm text-black/70">
                      {formatDateTime(contribution.paidAt)}
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
