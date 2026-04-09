import { AdminStatCard } from "@/components/admin/AdminStatCard";
import type { AdminSummary } from "@/types/api";

type AdminContributionSummaryProps = {
  summary: AdminSummary;
  formatAmount: (amountMinor: number) => string;
};

export function AdminContributionSummary({
  summary,
  formatAmount,
}: AdminContributionSummaryProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <AdminStatCard
        hint="Total records matching the current filter set."
        label="Matching Contributions"
        value={summary.totalContributionsCount.toLocaleString("en-GB")}
      />
      <AdminStatCard
        hint="Combined amount across the filtered contribution list."
        label="Matching Amount"
        value={formatAmount(summary.totalContributedAmountMinor)}
      />
      <AdminStatCard
        hint="Succeeded amount within the current filter set."
        label="Succeeded Amount"
        value={formatAmount(summary.totalSucceededAmountMinor)}
      />
    </section>
  );
}
