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
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "succeeded":
      return "Completed";
    case "failed":
      return "Failed";
    case "checkout_created":
      return "Pending payment";
    case "created":
      return "Started";
    default:
      return "Cancelled";
  }
}

function getSupporterDisplayName(contribution: AdminContributionListItem) {
  return contribution.donorName || contribution.guestEmail || "No name recorded";
}

export function AdminContributionsTable({
  contributions,
  formatAmount,
}: AdminContributionsTableProps) {
  return (
    <section className="gf-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="gf-kicker">
            Gift records
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Detailed activity
          </h2>
        </div>
        <p className="text-sm text-slate-500">{contributions.length} records</p>
      </div>

      {contributions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          No gifts matched the current filters.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4 lg:hidden">
            {contributions.map((contribution) => (
              <article
                className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4"
                key={contribution.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-950">
                      {formatAmount(contribution.amountMinor, contribution.currencyCode)}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {contribution.shortId}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contribution.status)}`}
                  >
                    {getStatusLabel(contribution.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <p>{formatDateTime(contribution.createdAt)}</p>
                  <p>{contribution.organisationName}</p>
                  <p>{contribution.fundName ?? "Unassigned fund"}</p>
                  <p>{getSupporterDisplayName(contribution)}</p>
                  <p>{contribution.guestEmail ?? "No email recorded"}</p>
                  <p>Paid at: {formatDateTime(contribution.paidAt)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 hidden overflow-x-auto lg:block">
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-500">
                  <th className="pb-1 pr-4">Created</th>
                  <th className="pb-1 pr-4">Gift</th>
                  <th className="pb-1 pr-4">Organisation</th>
                  <th className="pb-1 pr-4">Fund</th>
                  <th className="pb-1 pr-4">Amount</th>
                  <th className="pb-1 pr-4">Status</th>
                  <th className="pb-1 pr-4">Supporter</th>
                  <th className="pb-1 pr-4">Email</th>
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
                        {getStatusLabel(contribution.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {getSupporterDisplayName(contribution)}
                    </td>
                    <td className="px-4 py-4 text-sm text-black/70">
                      {contribution.guestEmail ?? "No email recorded"}
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
