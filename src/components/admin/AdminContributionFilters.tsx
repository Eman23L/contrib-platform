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
    <section className="gf-card p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="gf-kicker">
            Filters
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Find the gifts you need
          </h2>
        </div>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5" method="get">
        <input name="org" type="hidden" value={filters.organisationSlug} />

        <label className="block">
          <span className="gf-label">Organisation</span>
          <input
            className="gf-input bg-slate-50"
            disabled
            type="text"
            value={filters.organisationName}
          />
        </label>

        <label className="block">
          <span className="gf-label">Fund</span>
          <select
            className="gf-input"
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
          <span className="gf-label">Status</span>
          <select
            className="gf-input"
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
          <span className="gf-label">Start date</span>
          <input
            className="gf-input"
            defaultValue={filters.startDate}
            name="start"
            type="date"
          />
        </label>

        <label className="block">
          <span className="gf-label">End date</span>
          <input
            className="gf-input"
            defaultValue={filters.endDate}
            name="end"
            type="date"
          />
        </label>

        <div className="md:col-span-2 xl:col-span-5 flex flex-col gap-3 sm:flex-row">
          <button
            className="gf-button-primary"
            type="submit"
          >
            Apply filters
          </button>
          <a
            className="gf-button-secondary"
            href={`/admin/contributions?org=${filters.organisationSlug}`}
          >
            Clear filters
          </a>
        </div>
      </form>
    </section>
  );
}
