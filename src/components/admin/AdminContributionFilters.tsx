import type { AdminContributionFiltersData } from "@/types/api";

type AdminContributionFiltersProps = {
  filters: AdminContributionFiltersData;
};

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Created", value: "draft" },
  { label: "Checkout created", value: "checkout_created" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired", value: "expired" },
];

export function AdminContributionFilters({
  filters,
}: AdminContributionFiltersProps) {
  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Filters
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Narrow the contribution list
          </h2>
        </div>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5" method="get">
        <input name="org" type="hidden" value={filters.organisationSlug} />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black/70">Organisation</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4 text-base text-ink outline-none"
            disabled
            type="text"
            value={filters.organisationName}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black/70">Fund</span>
          <select
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            defaultValue={filters.selectedFundId}
            name="fund"
          >
            <option value="">All funds</option>
            {filters.availableFunds.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black/70">Status</span>
          <select
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            defaultValue={filters.selectedStatus}
            name="status"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value || "all"} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black/70">Start date</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            defaultValue={filters.startDate}
            name="start"
            type="date"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black/70">End date</span>
          <input
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            defaultValue={filters.endDate}
            name="end"
            type="date"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90"
            type="submit"
          >
            Apply filters
          </button>
          <a
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-4 text-base font-semibold text-ink transition hover:border-accent/30 hover:bg-accentSoft/20"
            href={`/admin/contributions?org=${filters.organisationSlug}`}
          >
            Clear filters
          </a>
        </div>
      </form>
    </section>
  );
}
