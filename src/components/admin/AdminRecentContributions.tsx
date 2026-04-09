import type { AdminRecentContribution } from "@/types/api";

type AdminRecentContributionsProps = {
  contributions: AdminRecentContribution[];
  formatAmount: (amountMinor: number) => string;
};

function formatDate(value: string) {
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
    default:
      return "bg-black/8 text-black/65";
  }
}

export function AdminRecentContributions({
  contributions,
  formatAmount,
}: AdminRecentContributionsProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Recent Contributions
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Latest activity
          </h2>
        </div>
        <p className="text-sm text-black/55">{contributions.length} shown</p>
      </div>

      {contributions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-black/[0.02] px-4 py-6 text-sm text-black/60">
          No contributions have been recorded for this organisation yet.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4 md:hidden">
            {contributions.map((contribution) => (
              <article
                className="rounded-2xl border border-black/8 bg-white px-4 py-4"
                key={contribution.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{formatAmount(contribution.amountMinor)}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contribution.status)}`}
                  >
                    {contribution.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-black/65">{formatDate(contribution.createdAt)}</p>
                <p className="mt-2 text-sm font-medium text-ink">
                  {contribution.organisationName}
                </p>
                <p className="mt-1 text-sm text-black/65">
                  {contribution.fundName ?? "Unassigned fund"}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40">
                  Contribution {contribution.shortId}
                </p>
                <p className="mt-2 text-sm text-black/60">
                  {contribution.guestEmail ?? "No guest email"}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                  <th className="pb-1 pr-4">Created</th>
                  <th className="pb-1 pr-4">Organisation</th>
                  <th className="pb-1 pr-4">Fund</th>
                  <th className="pb-1 pr-4">Amount</th>
                  <th className="pb-1 pr-4">Status</th>
                  <th className="pb-1 pr-4">Guest Email</th>
                  <th className="pb-1">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((contribution) => (
                  <tr className="rounded-2xl bg-black/[0.025]" key={contribution.id}>
                    <td className="rounded-l-2xl px-4 py-4 text-sm text-black/70">
                      {formatDate(contribution.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-ink">
                      {contribution.organisationName}
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {contribution.fundName ?? "Unassigned fund"}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-ink">
                      {formatAmount(contribution.amountMinor)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contribution.status)}`}
                      >
                        {contribution.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {contribution.guestEmail ?? "No guest email"}
                    </td>
                    <td className="rounded-r-2xl px-4 py-4 font-mono text-xs text-black/60">
                      {contribution.shortId}
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
