import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { AdminDashboardChrome } from "@/components/admin/AdminDashboardChrome";
import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { getDefaultOrganisationPublicSettings } from "@/lib/organisationSettings";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { getAdminDashboard } from "@/lib/services/admin/getAdminDashboard";
import type {
  AdminDashboardData,
  AdminCampaignSummaryItem,
  AdminFundBreakdownItem,
  AdminGivingTrendItem,
  AdminOrganisationSettings,
  AdminRecentContribution,
  AdminStatusSummaryItem,
  AdminTeamMemberItem,
} from "@/types/api";

type AdminPageProps = {
  searchParams: Promise<{
    org?: string;
    campaignError?: string;
    campaignSaved?: string;
    section?: string;
    settingsError?: string;
    settingsSaved?: string;
  }>;
};

type AdminSection =
  | "campaigns"
  | "funds"
  | "giving"
  | "overview"
  | "reports"
  | "settings"
  | "supporters"
  | "team";

type SettingsStatus = {
  error: string | null;
  saved: boolean;
};

type CampaignStatus = {
  error: string | null;
  saved: boolean;
};

function formatGbp(amountMinor: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amountMinor / 100);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  switch (status) {
    case "succeeded":
      return "Completed";
    case "checkout_created":
    case "pending_payment":
      return "Pending";
    case "failed":
      return "Failed";
    default:
      return status.replaceAll("_", " ");
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "succeeded":
      return "bg-emerald-50 text-emerald-700";
    case "failed":
      return "bg-rose-50 text-rose-700";
    case "checkout_created":
    case "pending_payment":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getShortId(value: string) {
  return value.slice(0, 8);
}

function formatOptionalDate(value: string | null) {
  return value ? formatShortDate(value) : "No activity";
}

function getStatusCount(statuses: AdminStatusSummaryItem[], names: string[]) {
  return statuses
    .filter((status) => names.includes(status.status))
    .reduce((total, status) => total + status.contributionsCount, 0);
}

function getStringSetting(settings: Record<string, unknown>, key: string) {
  const value = settings[key];

  return typeof value === "string" ? value.trim() : "";
}

function percentOf(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function getSupporterDisplayName(contribution: AdminRecentContribution) {
  return contribution.donorName || contribution.guestEmail || `Gift ${contribution.shortId}`;
}

function getAdminSection(section?: string): AdminSection {
  if (
    section === "campaigns" ||
    section === "funds" ||
    section === "giving" ||
    section === "reports" ||
    section === "settings" ||
    section === "supporters" ||
    section === "team"
  ) {
    return section;
  }

  return "overview";
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "bell"
    | "calendar"
    | "campaign"
    | "chart"
    | "chevron"
    | "download"
    | "funds"
    | "gift"
    | "home"
    | "members"
    | "plus"
    | "receipt"
    | "refresh"
    | "search"
    | "settings"
    | "support"
    | "team"
    | "wallet";
  className?: string;
}) {
  const paths: Record<typeof name, ReactNode> = {
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M3 10h18" />
      </>
    ),
    campaign: (
      <>
        <path d="m3 11 18-5v12L3 13z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15v-4" />
        <path d="M12 15V7" />
        <path d="M17 15v-6" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    funds: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="6" />
        <path d="M7 10h10" />
        <path d="M7 14h4" />
      </>
    ),
    gift: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="8" />
        <path d="M12 8v14" />
        <path d="M3 12h18" />
        <path d="M12 8H8.5A2.5 2.5 0 1 1 11 5.5V8" />
        <path d="M12 8h3.5A2.5 2.5 0 1 0 13 5.5V8" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    members: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-8 0v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M2 21v-2a4 4 0 0 1 3-3.87" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    receipt: (
      <>
        <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .67V2z" />
        <path d="M8 7h8" />
        <path d="M8 12h8" />
        <path d="M8 17h5" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 1-15.5 6.2" />
        <path d="M3 12A9 9 0 0 1 18.5 5.8" />
        <path d="M18 2v4h4" />
        <path d="M6 22v-4H2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.37.25.73.6.6 1h.09a2 2 0 1 1 0 4H20a1.7 1.7 0 0 0-.6 1Z" />
      </>
    ),
    support: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    team: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    wallet: (
      <>
        <path d="M20 7V6a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V7" />
        <path d="M16 14h2" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function DashboardStatCard({
  accent,
  icon,
  label,
  trend,
  value,
}: {
  accent: string;
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  trend: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${accent}`}>
          <Icon className="h-5 w-5" name={icon} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-600">{trend}</p>
        </div>
      </div>
    </article>
  );
}

function FundDonut({ funds }: { funds: AdminFundBreakdownItem[] }) {
  const shownFunds = funds.filter((fund) => fund.succeededAmountMinor > 0).slice(0, 4);
  const total = shownFunds.reduce((sum, fund) => sum + fund.totalAmountMinor, 0);
  const colors = ["#55b889", "#3b82f6", "#9b7bed", "#f7d154"];
  let cursor = 0;
  const segments = shownFunds.map((fund, index) => {
    const start = cursor;
    const share = percentOf(fund.totalAmountMinor, total);
    cursor += share;
    return `${colors[index]} ${start}% ${cursor}%`;
  });
  const background = segments.length > 0
    ? `conic-gradient(${segments.join(", ")}, #edf2f7 ${cursor}% 100%)`
    : "#edf2f7";

  return (
    <div className="grid gap-6 lg:grid-cols-[150px_1fr] lg:items-center">
      <div
        className="mx-auto h-36 w-36 rounded-full p-8 shadow-inner"
        style={{ background } as CSSProperties}
      >
        <div className="h-full w-full rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]" />
      </div>
      <div className="space-y-3">
        {shownFunds.length > 0 ? shownFunds.map((fund, index) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={fund.fundId ?? fund.fundName}>
            <span className="flex min-w-0 items-center gap-3 font-medium text-slate-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="truncate">{fund.fundName}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-700">
              {formatGbp(fund.totalAmountMinor)} ({percentOf(fund.totalAmountMinor, total)}%)
            </span>
          </div>
        )) : (
          <p className="text-sm text-slate-500">No paid fund activity yet.</p>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-950">
          <span>Total</span>
          <span>{formatGbp(total)}</span>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ trend }: { trend: AdminGivingTrendItem[] }) {
  const max = Math.max(...trend.map((item) => item.succeededAmountMinor), 0);

  if (max <= 0) {
    return (
      <EmptyState>
        No paid gifts are available for the current six-month trend window.
      </EmptyState>
    );
  }

  const coordinates = trend.map((item, index) => {
    const x = 16 + index * 86;
    const y = 154 - (item.succeededAmountMinor / max) * 104;
    return `${x},${y}`;
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold text-slate-500">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        Paid giving trend
      </div>
      <svg className="h-48 w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 462 180">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((line) => (
          <line key={line} stroke="#e8edf4" strokeWidth="1" x1="0" x2="462" y1={42 + line * 28} y2={42 + line * 28} />
        ))}
        <polyline fill="none" points={coordinates.join(" ")} stroke="#2f80ff" strokeWidth="3" />
        <polygon fill="url(#trendFill)" points={`${coordinates.join(" ")} 446,170 16,170`} />
        {coordinates.map((point) => {
          const [x, y] = point.split(",");
          return <circle cx={x} cy={y} fill="#fff" key={point} r="4" stroke="#2f80ff" strokeWidth="3" />;
        })}
      </svg>
      <div className="mt-1 grid grid-cols-6 text-center text-xs font-medium text-slate-500">
        {trend.map((item) => (
          <span key={item.monthKey}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function getTrendSummary(trend: AdminGivingTrendItem[]) {
  const current = trend.at(-1);
  const previous = trend.at(-2);

  if (!current || current.succeededAmountMinor === 0) {
    return "No paid gifts this month";
  }

  if (!previous || previous.succeededAmountMinor === 0) {
    return "First paid month in trend";
  }

  const change = Math.round(
    ((current.succeededAmountMinor - previous.succeededAmountMinor) / previous.succeededAmountMinor) * 100,
  );

  if (change === 0) {
    return "Flat vs previous month";
  }

  return `${change > 0 ? "Up" : "Down"} ${Math.abs(change)}% vs previous month`;
}

function getPaidAverage(totalAmountMinor: number, count: number) {
  return count > 0 ? Math.round(totalAmountMinor / count) : 0;
}

function RecentGivingTable({
  contributions,
  organisationSlug,
}: {
  contributions: AdminRecentContribution[];
  organisationSlug: string;
}) {
  const rows = contributions.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">Recent Giving</h2>
        <Link className="text-sm font-semibold text-blue-600" href={`/admin/contributions?org=${organisationSlug}`}>
          View all
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full table-fixed text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
              <th className="w-[26%] py-3 pr-4">Supporter</th>
              <th className="w-[20%] py-3 pr-4">Fund</th>
              <th className="w-[16%] py-3 pr-4">Amount</th>
              <th className="w-[18%] py-3 pr-4">Date</th>
              <th className="w-[20%] py-3">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? rows.map((contribution) => (
              <tr key={contribution.id}>
                <td className="py-3 pr-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-blue-100 text-xs font-bold text-slate-700">
                      {getSupporterDisplayName(contribution).slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-semibold text-slate-700">
                      {getSupporterDisplayName(contribution)}
                    </span>
                  </div>
                </td>
                <td className="truncate py-3 pr-4 text-sm text-slate-600">{contribution.fundName ?? "Unassigned"}</td>
                <td className="py-3 pr-4 text-sm font-semibold text-slate-950">{formatGbp(contribution.amountMinor)}</td>
                <td className="py-3 pr-4 text-sm text-slate-600">{formatShortDate(contribution.createdAt)}</td>
                <td className="py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(contribution.status)}`}>
                    {getStatusLabel(contribution.status)}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td className="py-6 text-sm text-slate-500" colSpan={5}>
                  No giving records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SectionContent({
  activeSection,
  activeSupporters,
  campaignStatus,
  dashboard,
  settingsStatus,
  userRole,
}: {
  activeSection: AdminSection;
  activeSupporters: number;
  campaignStatus: CampaignStatus;
  dashboard: AdminDashboardData;
  settingsStatus: SettingsStatus;
  userRole: string;
}) {
  if (activeSection === "supporters") {
    return (
      <SupportersSection
        activeSupporters={activeSupporters}
        dashboard={dashboard}
      />
    );
  }

  if (activeSection === "funds") {
    return <FundsSection dashboard={dashboard} />;
  }

  if (activeSection === "giving") {
    return (
      <GivingSection
        activeSupporters={activeSupporters}
        dashboard={dashboard}
      />
    );
  }

  if (activeSection === "campaigns") {
    return (
      <CampaignsSection
        canManageCampaigns={userRole === "owner" || userRole === "admin" || userRole === "finance"}
        campaignStatus={campaignStatus}
        dashboard={dashboard}
      />
    );
  }

  if (activeSection === "reports") {
    return <ReportsSection dashboard={dashboard} />;
  }

  if (activeSection === "team") {
    return <TeamSection dashboard={dashboard} />;
  }

  if (activeSection === "settings") {
    return (
      <SettingsSection
        canEditSettings={userRole === "owner" || userRole === "admin"}
        dashboard={dashboard}
        settingsStatus={settingsStatus}
      />
    );
  }

  return null;
}

function GivingSection({
  activeSupporters,
  dashboard,
}: {
  activeSupporters: number;
  dashboard: AdminDashboardData;
}) {
  const pendingCount = getStatusCount(dashboard.statusSummary, ["created", "checkout_created", "pending_payment"]);

  return (
    <div className="space-y-5 p-5 xl:p-7">
      <SectionIntro title="Giving">
        Contribution records and payment status for {dashboard.organisationName}.
      </SectionIntro>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          accent="bg-emerald-50 text-emerald-600"
          icon="wallet"
          label="Paid Total"
          trend="Succeeded gifts only"
          value={formatGbp(dashboard.summary.totalSucceededAmountMinor)}
        />
        <DashboardStatCard
          accent="bg-blue-50 text-blue-600"
          icon="gift"
          label="Gift Records"
          trend="All contribution statuses"
          value={dashboard.summary.totalContributionsCount.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-violet-50 text-violet-600"
          icon="members"
          label="Supporters"
          trend="Unique emails in records"
          value={activeSupporters.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-amber-50 text-amber-700"
          icon="calendar"
          label="Pending"
          trend="Checkout or payment in progress"
          value={pendingCount.toLocaleString("en-GB")}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <RecentGivingTable
          contributions={dashboard.recentContributions}
          organisationSlug={dashboard.organisationSlug}
        />

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Payment Status</h2>
          <div className="mt-5 space-y-3">
            {dashboard.statusSummary.length > 0 ? dashboard.statusSummary.map((status) => (
              <div
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                key={status.status}
              >
                <span className="font-semibold text-slate-700">
                  {getStatusLabel(status.status)}
                </span>
                <span className="text-slate-500">
                  {status.contributionsCount} gifts - {formatGbp(status.totalAmountMinor)}
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No payment activity yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionIntro({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{children}</p>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-sm leading-6 text-slate-600">
      {children}
    </div>
  );
}

function SupportersSection({
  activeSupporters,
  dashboard,
}: {
  activeSupporters: number;
  dashboard: AdminDashboardData;
}) {
  const supporters = dashboard.supporterSummaries;
  const paidSupporters = supporters.filter((supporter) => supporter.totalGivenAmountMinor > 0);

  return (
    <div className="space-y-5 p-5 xl:p-7">
      <SectionIntro title="Supporters">
        People linked to contribution records for {dashboard.organisationName}.
      </SectionIntro>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStatCard
          accent="bg-violet-50 text-violet-600"
          icon="members"
          label="Known Supporters"
          trend="Unique emails in giving records"
          value={activeSupporters.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-emerald-50 text-emerald-600"
          icon="wallet"
          label="Paid Supporters"
          trend="Supporters with succeeded gifts"
          value={paidSupporters.length.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-blue-50 text-blue-600"
          icon="gift"
          label="Total Gifts"
          trend="All contribution records"
          value={dashboard.summary.totalContributionsCount.toLocaleString("en-GB")}
        />
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <h2 className="text-base font-semibold text-slate-950">Supporter Records</h2>
        <div className="mt-4 overflow-x-auto">
          {supporters.length > 0 ? (
            <table className="min-w-full table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <th className="w-[26%] py-3 pr-4">Supporter</th>
                  <th className="w-[22%] py-3 pr-4">Email</th>
                  <th className="w-[13%] py-3 pr-4">Paid Total</th>
                  <th className="w-[10%] py-3 pr-4">Gifts</th>
                  <th className="w-[13%] py-3 pr-4">Average</th>
                  <th className="w-[13%] py-3 pr-4">First Gift</th>
                  <th className="w-[13%] py-3 pr-4">Last Gift</th>
                  <th className="w-[10%] py-3">Latest Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supporters.map((supporter) => (
                  <tr key={supporter.email}>
                    <td className="truncate py-3 pr-4 text-sm font-semibold text-slate-700">{supporter.displayName}</td>
                    <td className="truncate py-3 pr-4 text-sm text-slate-600">{supporter.email}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-slate-950">{formatGbp(supporter.totalGivenAmountMinor)}</td>
                    <td className="py-3 pr-4 text-sm text-slate-600">{supporter.giftsCount.toLocaleString("en-GB")}</td>
                    <td className="py-3 pr-4 text-sm text-slate-600">{formatGbp(supporter.averageGiftAmountMinor)}</td>
                    <td className="py-3 pr-4 text-sm text-slate-600">{formatShortDate(supporter.firstGiftAt)}</td>
                    <td className="py-3 pr-4 text-sm text-slate-600">{formatShortDate(supporter.lastGiftAt)}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(supporter.latestStatus)}`}>
                        {getStatusLabel(supporter.latestStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState>
              No supporter records are available yet. Supporters appear here after a contributor gives with an email address.
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}

function FundsSection({ dashboard }: { dashboard: AdminDashboardData }) {
  const activeFunds = dashboard.fundBreakdown.filter((fund) => fund.isActive);
  const fundsWithGifts = dashboard.fundBreakdown.filter((fund) => fund.contributionsCount > 0);

  return (
    <div className="space-y-5 p-5 xl:p-7">
      <SectionIntro title="Funds">
        Donation categories, public visibility, and real giving performance.
      </SectionIntro>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardStatCard
          accent="bg-blue-50 text-blue-600"
          icon="funds"
          label="Funds"
          trend="Configured in this organisation"
          value={dashboard.fundBreakdown.length.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-emerald-50 text-emerald-600"
          icon="gift"
          label="Public Funds"
          trend="Shown on the giving page"
          value={activeFunds.length.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-violet-50 text-violet-600"
          icon="wallet"
          label="Funds With Gifts"
          trend="Have contribution records"
          value={fundsWithGifts.length.toLocaleString("en-GB")}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Fund Breakdown</h2>
          <div className="mt-5">
            <FundDonut funds={dashboard.fundBreakdown} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Fund Activity</h2>
          <div className="mt-5 space-y-3">
            {dashboard.fundBreakdown.length > 0 ? dashboard.fundBreakdown.map((fund) => (
              <div className="rounded-xl bg-slate-50 px-4 py-3" key={fund.fundId ?? fund.fundName}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-slate-800">{fund.fundName}</p>
                  <p className="shrink-0 text-sm font-semibold text-slate-950">{formatGbp(fund.succeededAmountMinor)}</p>
                </div>
                {fund.description ? (
                  <p className="mt-1 text-xs text-slate-500">{fund.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  {fund.contributionsCount.toLocaleString("en-GB")} gifts - Average {formatGbp(getPaidAverage(fund.succeededAmountMinor, fund.contributionsCount))} - Last activity {formatOptionalDate(fund.latestContributionAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${fund.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {fund.isActive ? "Public giving page" : "Not public"}
                  </span>
                  {fund.isDefault ? (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Default fund
                    </span>
                  ) : null}
                </div>
              </div>
            )) : (
              <EmptyState>
                No funds are configured for this organisation. Add funds before public giving can route gifts to useful categories.
              </EmptyState>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatAmountInput(amountMinor: number | null) {
  return amountMinor ? (amountMinor / 100).toFixed(2) : "";
}

function CampaignForm({
  campaign,
  dashboard,
  mode,
}: {
  campaign?: AdminCampaignSummaryItem;
  dashboard: AdminDashboardData;
  mode: "create" | "edit";
}) {
  const fundOptions = dashboard.fundBreakdown.filter((fund) =>
    fund.fundId && (mode === "edit" || fund.isActive)
  );
  const defaultFundId =
    campaign?.fundId ??
    fundOptions.find((fund) => fund.isDefault)?.fundId ??
    fundOptions[0]?.fundId ??
    "";

  return (
    <form action="/admin/campaigns" className="mt-4 grid gap-4 md:grid-cols-2" method="post">
      <input name="currentOrgSlug" type="hidden" value={dashboard.organisationSlug} />
      {campaign?.campaignId ? (
        <input name="campaignId" type="hidden" value={campaign.campaignId} />
      ) : null}

      <label className="block">
        <span className="gf-label">Campaign name</span>
        <input
          className="gf-input"
          defaultValue={campaign?.campaignName ?? ""}
          maxLength={120}
          name="name"
          placeholder="Building fund appeal"
          required
        />
      </label>

      <label className="block">
        <span className="gf-label">Linked fund</span>
        <select className="gf-input" defaultValue={defaultFundId} name="fundId" required>
          <option value="">Choose a fund</option>
          {fundOptions.map((fund) => (
            <option key={fund.fundId ?? fund.fundName} value={fund.fundId ?? ""}>
              {fund.isActive ? fund.fundName : `${fund.fundName} (inactive)`}
            </option>
          ))}
        </select>
      </label>

      <label className="block md:col-span-2">
        <span className="gf-label">Description</span>
        <textarea
          className="gf-input min-h-24"
          defaultValue={campaign?.description ?? ""}
          maxLength={500}
          name="description"
          placeholder="Describe what this campaign is raising money for."
        />
      </label>

      <label className="block">
        <span className="gf-label">Goal amount</span>
        <input
          className="gf-input"
          defaultValue={formatAmountInput(campaign?.goalAmountMinor ?? null)}
          min="0.01"
          name="goalAmount"
          placeholder="50000.00"
          step="0.01"
          type="number"
        />
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
        <input
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
          defaultChecked={campaign?.isActive ?? true}
          name="isActive"
          type="checkbox"
        />
        Active
      </label>

      <label className="block">
        <span className="gf-label">Start date</span>
        <input
          className="gf-input"
          defaultValue={formatDateInput(campaign?.startsAt ?? null)}
          name="startsAt"
          type="date"
        />
      </label>

      <label className="block">
        <span className="gf-label">End date</span>
        <input
          className="gf-input"
          defaultValue={formatDateInput(campaign?.endsAt ?? null)}
          name="endsAt"
          type="date"
        />
      </label>

      <div className="md:col-span-2">
        <button className="gf-button-primary" type="submit">
          {mode === "create" ? "Add campaign" : "Save campaign"}
        </button>
      </div>
    </form>
  );
}

function CampaignsSection({
  canManageCampaigns,
  campaignStatus,
  dashboard,
}: {
  canManageCampaigns: boolean;
  campaignStatus: CampaignStatus;
  dashboard: AdminDashboardData;
}) {
  const activeFunds = dashboard.fundBreakdown.filter((fund) => fund.fundId && fund.isActive);

  return (
    <div className="space-y-5 p-5 xl:p-7">
      <SectionIntro title="Campaigns">
        Goal-based fundraising from campaign records linked to real contributions.
      </SectionIntro>

      {campaignStatus.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {campaignStatus.error}
        </div>
      ) : null}

      {campaignStatus.saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          Campaign saved.
        </div>
      ) : null}

      {canManageCampaigns ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Add Campaign</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a real campaign linked to an existing public fund.
          </p>
          {activeFunds.length > 0 ? (
            <CampaignForm dashboard={dashboard} mode="create" />
          ) : (
            <EmptyState>
              Add an active fund before creating a campaign.
            </EmptyState>
          )}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <h2 className="text-base font-semibold text-slate-950">Campaign Records</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {dashboard.campaignSummaries.length > 0 ? dashboard.campaignSummaries.map((campaign) => {
            const progress = campaign.goalAmountMinor
              ? Math.min(percentOf(campaign.totalRaisedAmountMinor, campaign.goalAmountMinor), 100)
              : null;

            return (
            <article className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4" key={campaign.campaignId ?? campaign.campaignName}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{campaign.campaignName}</p>
                  <p className="mt-1 text-xs text-slate-500">{campaign.fundName ?? "No linked fund name"}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${campaign.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {campaign.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {campaign.description ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">{campaign.description}</p>
              ) : null}
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Raised</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatGbp(campaign.totalRaisedAmountMinor)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Gifts</p>
                  <p className="mt-1 font-semibold text-slate-950">{campaign.giftsCount.toLocaleString("en-GB")}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Recent</p>
                  <p className="mt-1 font-semibold text-slate-950">{formatOptionalDate(campaign.latestContributionAt)}</p>
                </div>
              </div>
              {progress !== null ? (
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Goal {formatGbp(campaign.goalAmountMinor ?? 0)}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}
              <p className="mt-4 text-xs text-slate-500">
                {campaign.startsAt ? `Starts ${formatShortDate(campaign.startsAt)}` : "No start date"} - {campaign.endsAt ? `Ends ${formatShortDate(campaign.endsAt)}` : "No end date"}
              </p>
              {canManageCampaigns ? (
                <details className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-blue-600">
                    Edit campaign
                  </summary>
                  <CampaignForm campaign={campaign} dashboard={dashboard} mode="edit" />
                </details>
              ) : null}
            </article>
          );
          }) : (
            <EmptyState>
              No campaigns are configured for this organisation. Campaign cards will appear here once real campaign records exist.
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}

function ReportsSection({ dashboard }: { dashboard: AdminDashboardData }) {
  const pendingCount = getStatusCount(dashboard.statusSummary, ["created", "checkout_created", "pending_payment"]);
  const failedCount = getStatusCount(dashboard.statusSummary, ["failed", "cancelled", "expired"]);
  const exportHref = `/admin/reports/contributions?org=${dashboard.organisationSlug}`;
  const ledgerHref = `/admin/contributions?org=${dashboard.organisationSlug}`;
  const paidGiftCount = getStatusCount(dashboard.statusSummary, ["succeeded"]);

  return (
    <div className="space-y-5 p-5 xl:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <SectionIntro title="Reports">
          Giving and payment reporting from current contribution records.
        </SectionIntro>
        <Link
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
          href={exportHref}
        >
          <Icon className="h-4 w-4" name="download" />
          Download CSV
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Report Filters</h2>
            <p className="mt-1 text-sm text-slate-500">
              The detailed giving ledger supports date, fund, and status filters. CSV export respects those filters.
            </p>
          </div>
          <Link className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700" href={ledgerHref}>
            Open filtered ledger
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          accent="bg-emerald-50 text-emerald-600"
          icon="wallet"
          label="Paid Total"
          trend="Succeeded gifts only"
          value={formatGbp(dashboard.summary.totalSucceededAmountMinor)}
        />
        <DashboardStatCard
          accent="bg-blue-50 text-blue-600"
          icon="gift"
          label="Gift Records"
          trend="All statuses"
          value={dashboard.summary.totalContributionsCount.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-violet-50 text-violet-600"
          icon="wallet"
          label="Average Paid Gift"
          trend="Succeeded gifts only"
          value={formatGbp(getPaidAverage(dashboard.summary.totalSucceededAmountMinor, paidGiftCount))}
        />
        <DashboardStatCard
          accent="bg-amber-50 text-amber-700"
          icon="calendar"
          label="Pending"
          trend="Checkout or payment in progress"
          value={pendingCount.toLocaleString("en-GB")}
        />
        <DashboardStatCard
          accent="bg-rose-50 text-rose-700"
          icon="chart"
          label="Not Completed"
          trend="Failed, cancelled, or expired"
          value={failedCount.toLocaleString("en-GB")}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Giving Trend</h2>
          <div className="mt-5">
            <TrendChart trend={dashboard.givingTrend} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Fund Chart</h2>
          <div className="mt-5">
            <FundDonut funds={dashboard.fundBreakdown} />
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Breakdown by Fund</h2>
          <div className="mt-5 space-y-3">
            {dashboard.fundBreakdown.length > 0 ? dashboard.fundBreakdown.map((fund) => (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm" key={fund.fundId ?? fund.fundName}>
                <span className="truncate font-semibold text-slate-700">{fund.fundName}</span>
                <span className="shrink-0 text-slate-600">{fund.contributionsCount} gifts - {formatGbp(fund.succeededAmountMinor)}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No fund activity yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-base font-semibold text-slate-950">Breakdown by Status</h2>
          <div className="mt-5 space-y-3">
            {dashboard.statusSummary.length > 0 ? dashboard.statusSummary.map((status) => (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm" key={status.status}>
                <span className="font-semibold text-slate-700">{getStatusLabel(status.status)}</span>
                <span className="text-slate-500">{status.contributionsCount} gifts - {formatGbp(status.totalAmountMinor)}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No payment activity yet.</p>
            )}
          </div>
        </section>
      </div>

      <RecentGivingTable contributions={dashboard.recentContributions} organisationSlug={dashboard.organisationSlug} />
    </div>
  );
}

function TeamSection({ dashboard }: { dashboard: AdminDashboardData }) {
  return (
    <div className="space-y-5 p-5 xl:p-7">
      <SectionIntro title="Team">
        Current members with admin, finance, owner, or member records for this organisation.
      </SectionIntro>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <h2 className="text-base font-semibold text-slate-950">Team Members</h2>
        <div className="mt-4 overflow-x-auto">
          {dashboard.teamMembers.length > 0 ? (
            <table className="min-w-full table-fixed text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <th className="w-[44%] py-3 pr-4">Member</th>
                  <th className="w-[18%] py-3 pr-4">Role</th>
                  <th className="w-[18%] py-3 pr-4">Status</th>
                  <th className="w-[20%] py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboard.teamMembers.map((member: AdminTeamMemberItem) => (
                  <tr key={member.id}>
                    <td className="py-3 pr-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {member.displayName ?? member.email ?? "Name not set"}
                        </p>
                        {member.email && member.email !== member.displayName ? (
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {member.email}
                          </p>
                        ) : null}
                        <p className="mt-1 font-mono text-xs text-slate-400">
                          ID {getShortId(member.userId)}...
                        </p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-sm font-semibold text-slate-700">{getRoleLabel(member.role)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${member.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-600">{formatShortDate(member.joinedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState>
              No team member records are visible for this organisation.
            </EmptyState>
          )}
        </div>
      </section>
    </div>
  );
}

function getSettingsErrorMessage(error: string | null) {
  if (!error) {
    return null;
  }

  switch (error) {
    case "forbidden":
      return "Only owners and admins can edit organisation settings.";
    case "missing-org":
    case "not-found":
      return "We could not find this organisation to update settings.";
    case "save-failed":
      return "We could not save these settings. Check the slug is unique and try again.";
    case "unauthorized":
      return "This account cannot edit settings for this organisation.";
    default:
      return error;
  }
}

function SettingsField({
  children,
  helper,
  label,
}: {
  children: ReactNode;
  helper?: string;
  label: string;
}) {
  return (
    <label className="block">
      <span className="gf-label">{label}</span>
      {children}
      {helper ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {helper}
        </span>
      ) : null}
    </label>
  );
}

function SettingsInput({
  defaultValue,
  disabled,
  maxLength,
  name,
  placeholder,
  required = false,
  type = "text",
}: {
  defaultValue: string;
  disabled: boolean;
  maxLength?: number;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      className="gf-input"
      defaultValue={defaultValue}
      disabled={disabled}
      maxLength={maxLength}
      name={name}
      placeholder={placeholder}
      required={required}
      type={type}
    />
  );
}

function SettingsTextarea({
  defaultValue,
  disabled,
  maxLength,
  name,
  placeholder,
}: {
  defaultValue: string;
  disabled: boolean;
  maxLength: number;
  name: string;
  placeholder?: string;
}) {
  return (
    <textarea
      className="gf-input min-h-24 resize-y"
      defaultValue={defaultValue}
      disabled={disabled}
      maxLength={maxLength}
      name={name}
      placeholder={placeholder}
      rows={3}
    />
  );
}

function getCustomPublicSettings(settings: AdminOrganisationSettings) {
  const defaults = getDefaultOrganisationPublicSettings(settings.name);

  return {
    givingActionLabel:
      getStringSetting(settings.settings, "givingActionLabel") === defaults.givingActionLabel
        ? ""
        : getStringSetting(settings.settings, "givingActionLabel"),
    givingPageHeading:
      getStringSetting(settings.settings, "givingPageHeading") === defaults.givingPageHeading
        ? ""
        : getStringSetting(settings.settings, "givingPageHeading"),
    givingPageIntro:
      getStringSetting(settings.settings, "givingPageIntro") === defaults.givingPageIntro
        ? ""
        : getStringSetting(settings.settings, "givingPageIntro"),
    logoUrl: getStringSetting(settings.settings, "logoUrl"),
    publicPageHeading:
      getStringSetting(settings.settings, "publicPageHeading") === defaults.publicPageHeading
        ? ""
        : getStringSetting(settings.settings, "publicPageHeading"),
    publicPageIntro:
      getStringSetting(settings.settings, "publicPageIntro") === defaults.publicPageIntro
        ? ""
        : getStringSetting(settings.settings, "publicPageIntro"),
    supportEmail: getStringSetting(settings.settings, "supportEmail"),
    thankYouMessage:
      getStringSetting(settings.settings, "thankYouMessage") === defaults.thankYouMessage
        ? ""
        : getStringSetting(settings.settings, "thankYouMessage"),
  };
}

function SettingsSection({
  canEditSettings,
  dashboard,
  settingsStatus,
}: {
  canEditSettings: boolean;
  dashboard: AdminDashboardData;
  settingsStatus: SettingsStatus;
}) {
  const settings = dashboard.organisationSettings;
  const defaultPublicSettings = getDefaultOrganisationPublicSettings(settings.name);
  const customPublicSettings = getCustomPublicSettings(settings);
  const errorMessage = getSettingsErrorMessage(settingsStatus.error);

  return (
    <div className="space-y-5 p-5 xl:p-7">
      <SectionIntro title="Settings">
        Current organisation configuration used by public giving and admin scoping.
      </SectionIntro>

      {settingsStatus.saved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          Organisation settings saved.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="max-w-4xl">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Organisation Settings</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Safe public identity and wording fields for this organisation.
              </p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${canEditSettings ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {canEditSettings ? "Editable" : "Read only"}
            </span>
          </div>

          <form action="/admin/settings" className="mt-5 space-y-5" method="post">
            <input name="currentOrgSlug" type="hidden" value={settings.slug} />

            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField label="Display name">
                <SettingsInput
                  defaultValue={settings.name}
                  disabled={!canEditSettings}
                  maxLength={120}
                  name="name"
                  placeholder="Your organisation"
                  required
                />
              </SettingsField>
              <SettingsField label="Organisation slug" helper="Used in the public URL. Spaces and capitals are saved as lowercase hyphens.">
                <SettingsInput
                  defaultValue={settings.slug}
                  disabled={!canEditSettings}
                  maxLength={80}
                  name="slug"
                  placeholder="your-organisation"
                  required
                />
              </SettingsField>
              <SettingsField label="Legal name">
                <SettingsInput
                  defaultValue={settings.legalName ?? ""}
                  disabled={!canEditSettings}
                  maxLength={160}
                  name="legalName"
                  placeholder="Registered legal name"
                />
              </SettingsField>
              <SettingsField label="Timezone">
                <SettingsInput
                  defaultValue={settings.timezone}
                  disabled={!canEditSettings}
                  maxLength={80}
                  name="timezone"
                  placeholder="Europe/London"
                  required
                />
              </SettingsField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField label="Public page heading">
                <SettingsInput
                  defaultValue={customPublicSettings.publicPageHeading}
                  disabled={!canEditSettings}
                  maxLength={140}
                  name="publicPageHeading"
                  placeholder={defaultPublicSettings.publicPageHeading}
                />
              </SettingsField>
              <SettingsField label="Giving page heading">
                <SettingsInput
                  defaultValue={customPublicSettings.givingPageHeading}
                  disabled={!canEditSettings}
                  maxLength={140}
                  name="givingPageHeading"
                  placeholder={defaultPublicSettings.givingPageHeading}
                />
              </SettingsField>
            </div>

            <SettingsField label="Public page intro">
              <SettingsTextarea
                defaultValue={customPublicSettings.publicPageIntro}
                disabled={!canEditSettings}
                maxLength={500}
                name="publicPageIntro"
                placeholder={defaultPublicSettings.publicPageIntro}
              />
            </SettingsField>

            <SettingsField label="Giving page intro">
              <SettingsTextarea
                defaultValue={customPublicSettings.givingPageIntro}
                disabled={!canEditSettings}
                maxLength={500}
                name="givingPageIntro"
                placeholder={defaultPublicSettings.givingPageIntro}
              />
            </SettingsField>

            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField label="Giving action wording">
                <SettingsInput
                  defaultValue={customPublicSettings.givingActionLabel}
                  disabled={!canEditSettings}
                  maxLength={80}
                  name="givingActionLabel"
                  placeholder={defaultPublicSettings.givingActionLabel}
                />
              </SettingsField>
              <SettingsField label="Support email">
                <SettingsInput
                  defaultValue={customPublicSettings.supportEmail}
                  disabled={!canEditSettings}
                  maxLength={254}
                  name="supportEmail"
                  placeholder="support@example.org"
                  type="email"
                />
              </SettingsField>
            </div>

            <SettingsField label="Thank-you message">
              <SettingsTextarea
                defaultValue={customPublicSettings.thankYouMessage}
                disabled={!canEditSettings}
                maxLength={500}
                name="thankYouMessage"
                placeholder={defaultPublicSettings.thankYouMessage}
              />
            </SettingsField>

            <SettingsField label="Logo URL" helper="Stored for public branding; image rendering can be expanded later without changing this data model.">
              <SettingsInput
                defaultValue={customPublicSettings.logoUrl}
                disabled={!canEditSettings}
                maxLength={500}
                name="logoUrl"
                placeholder="https://example.org/logo.png"
                type="url"
              />
            </SettingsField>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              Currency is currently <span className="font-semibold text-slate-900">{settings.currencyCode}</span>. Stripe checkout is configured separately, so payment secrets are not shown or editable here.
            </div>

            {canEditSettings ? (
              <button className="gf-button-primary" type="submit">
                Save organisation settings
              </button>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );
}

function AdminDashboardShell({
  activeSection,
  campaignStatus,
  dashboard,
  settingsStatus,
  userEmail,
  userRole,
}: {
  activeSection: AdminSection;
  campaignStatus: CampaignStatus;
  dashboard: AdminDashboardData;
  settingsStatus: SettingsStatus;
  userEmail: string | null;
  userRole: string;
}) {
  const activeSupporters = dashboard.activeSupportersCount;
  const pendingCount = getStatusCount(dashboard.statusSummary, ["created", "checkout_created", "pending_payment"]);
  const failedCount = getStatusCount(dashboard.statusSummary, ["failed", "cancelled", "expired"]);
  const orgParam = `?org=${dashboard.organisationSlug}`;
  const activityItems = dashboard.recentContributions.slice(0, 5);

  return (
    <AdminDashboardChrome
      activeSection={activeSection}
      organisationName={dashboard.organisationName}
      organisationSlug={dashboard.organisationSlug}
      userEmail={userEmail}
    >
      {activeSection === "overview" ? (
        <div className="grid gap-5 p-5 xl:grid-cols-[1fr_290px] xl:p-7">
              <section className="min-w-0 space-y-5">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {dashboard.organisationName} Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Here is what is happening with your giving community.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <DashboardStatCard
                    accent="bg-emerald-50 text-emerald-600"
                    icon="wallet"
                    label="Total Raised"
                    trend={getTrendSummary(dashboard.givingTrend)}
                    value={formatGbp(dashboard.summary.totalContributedAmountMinor)}
                  />
                  <DashboardStatCard
                    accent="bg-blue-50 text-blue-600"
                    icon="gift"
                    label="Total Gifts"
                    trend="All contribution statuses"
                    value={dashboard.summary.totalContributionsCount.toLocaleString("en-GB")}
                  />
                  <DashboardStatCard
                    accent="bg-violet-50 text-violet-600"
                    icon="members"
                    label="Active Supporters"
                    trend="Unique emails in records"
                    value={activeSupporters.toLocaleString("en-GB")}
                  />
                  <DashboardStatCard
                    accent="bg-emerald-50 text-emerald-600"
                    icon="refresh"
                    label="Needs Attention"
                    trend="Pending, failed, cancelled, or expired"
                    value={(pendingCount + failedCount).toLocaleString("en-GB")}
                  />
                </div>

                <div className="grid gap-5 2xl:grid-cols-[1.25fr_1fr]">
                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-slate-950">Giving Trends</h2>
                      <span className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                        Last 6 months
                      </span>
                    </div>
                    <TrendChart trend={dashboard.givingTrend} />
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-slate-950">Fund Breakdown</h2>
                      <span className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                        This Month
                      </span>
                    </div>
                    <FundDonut funds={dashboard.fundBreakdown} />
                  </section>
                </div>

                <RecentGivingTable
                  contributions={dashboard.recentContributions}
                  organisationSlug={dashboard.organisationSlug}
                />
              </section>

              <aside className="space-y-5">
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-950">Recent Activity</h2>
                    <Link className="text-sm font-semibold text-blue-600" href={`/admin/contributions${orgParam}`}>
                      View all
                    </Link>
                  </div>
                  <div className="mt-5 space-y-5">
                    {activityItems.length > 0 ? activityItems.map((item, index) => (
                      <div className="flex gap-3" key={item.id}>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${index % 3 === 0 ? "bg-emerald-50 text-emerald-600" : index % 3 === 1 ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>
                          <Icon className="h-4 w-4" name={index % 2 === 0 ? "support" : "gift"} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">{getStatusLabel(item.status)} gift</p>
                            <p className="shrink-0 text-xs text-slate-400">{formatShortDate(item.createdAt)}</p>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {formatGbp(item.amountMinor)} to {item.fundName ?? "Unassigned fund"}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500">No recent activity yet.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <h2 className="text-base font-semibold text-slate-950">Quick Actions</h2>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["Campaigns", "campaign", "border-blue-100 bg-blue-50 text-blue-600", `/admin${orgParam}&section=campaigns`],
                      ["Reports", "chart", "border-emerald-100 bg-emerald-50 text-emerald-700", `/admin${orgParam}&section=reports`],
                      ["Team", "team", "border-violet-100 bg-violet-50 text-violet-600", `/admin${orgParam}&section=team`],
                      ["Giving", "gift", "border-amber-100 bg-amber-50 text-amber-700", `/admin/contributions${orgParam}`],
                    ].map(([label, icon, classes, href]) => (
                      <Link
                        className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold ${classes}`}
                        href={href}
                        key={label}
                      >
                        <Icon className="h-4 w-4" name={icon as Parameters<typeof Icon>[0]["name"]} />
                        {label}
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-950">Payment Health</h2>
                    <Link className="text-sm font-semibold text-blue-600" href={`/admin/contributions${orgParam}`}>
                      View all
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full ${failedCount > 0 ? "bg-rose-50 text-rose-700" : pendingCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}>
                      <Icon className="h-5 w-5" name="home" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500">Payment states</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{failedCount + pendingCount}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {failedCount > 0
                          ? `${failedCount} not completed`
                          : pendingCount > 0
                            ? `${pendingCount} pending`
                            : "No pending or failed gifts"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${failedCount > 0 ? "bg-rose-50 text-rose-700" : pendingCount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {failedCount > 0 ? "Review" : pendingCount > 0 ? "Pending" : "Clear"}
                    </span>
                  </div>
                </section>
              </aside>
      </div>
      ) : (
        <SectionContent
          activeSection={activeSection}
          activeSupporters={activeSupporters}
          campaignStatus={campaignStatus}
          dashboard={dashboard}
          settingsStatus={settingsStatus}
          userRole={userRole}
        />
      )}
    </AdminDashboardChrome>
  );
}

type MissingOrganisationStateProps = {
  availableOrgs: Array<{
    name: string;
    role: string;
    slug: string;
  }>;
  userEmail: string | null;
};

type UnauthorizedStateProps = {
  availableOrgs: Array<{
    name: string;
    role: string;
    slug: string;
  }>;
  requestedOrgSlug: string | null;
  userEmail: string | null;
};

function buildGivingPath(orgSlug?: string | null) {
  return orgSlug ? `/o/${encodeURIComponent(orgSlug)}/give` : null;
}

function MissingOrganisationState({
  availableOrgs,
  userEmail,
}: MissingOrganisationStateProps) {
  return (
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="gf-kicker">
            GetFlow
          </p>
          <h1 className="gf-title mt-3">
            Choose an organisation
          </h1>
          <p className="gf-copy mt-4">
            Signed in as
            <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs">
              {userEmail ?? "unknown user"}
            </code>
            . Select one of the organisations where you hold an admin or finance
            role.
          </p>
          <div className="mt-6 space-y-3">
            {availableOrgs.map((organisation) => (
              <Link
                className="gf-card-soft flex items-center justify-between gap-4 px-4 py-4 transition hover:border-[#b7d9bd] hover:bg-accentSoft"
                href={`/admin?org=${organisation.slug}`}
                key={organisation.slug}
              >
                <span>
                  <span className="block text-base font-semibold text-slate-950">
                    {organisation.name}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    Role: {organisation.role}
                  </span>
                </span>
                <span className="text-sm font-medium text-[#5f7f66]">Open dashboard</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function UnauthorizedState({
  availableOrgs,
  requestedOrgSlug,
  userEmail,
}: UnauthorizedStateProps) {
  const givingPath = buildGivingPath(requestedOrgSlug);
  const accountPath = "/account";

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="text-sm font-medium text-red-700">
            Access needed
          </p>
          <h1 className="gf-title mt-3">
            This dashboard is only available to organisation admins.
          </h1>
          <p className="gf-copy mt-4">
            You are signed in, but this account does not have admin access.
          </p>
          {userEmail ? (
            <p className="mt-3 text-sm text-slate-500">
              Signed in as {userEmail}.
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link className="gf-button-primary" href={accountPath}>
              Go to my account
            </Link>
            {givingPath ? (
              <Link className="gf-button-secondary" href={givingPath}>
                Go to giving page
              </Link>
            ) : null}
            <form action="/auth/sign-out" method="post">
              <button className="gf-button-secondary w-full sm:w-auto" type="submit">
                Sign in with a different account
              </button>
            </form>
          </div>

          {availableOrgs.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm font-medium text-slate-600">
                You can still open these organisations:
              </p>
              <div className="mt-4 space-y-3">
                {availableOrgs.map((organisation) => (
                  <Link
                    className="gf-card-soft flex items-center justify-between gap-4 px-4 py-4 transition hover:border-[#b7d9bd] hover:bg-accentSoft"
                    href={`/admin?org=${organisation.slug}`}
                    key={organisation.slug}
                  >
                    <span>
                      <span className="block text-base font-semibold text-slate-950">
                        {organisation.name}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-[#5f7f66]">Open dashboard</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { campaignError, campaignSaved, org, section, settingsError, settingsSaved } = await searchParams;
  const activeSection = getAdminSection(section);
  const campaignStatus: CampaignStatus = {
    error: campaignError ?? null,
    saved: campaignSaved === "1",
  };
  const settingsStatus: SettingsStatus = {
    error: settingsError ?? null,
    saved: settingsSaved === "1",
  };
  const access = await requireAdminRole(org);

  if (access.kind === "unauthenticated") {
    redirect(access.signInPath);
  }

  if (access.kind === "missing_organisation") {
    if (access.memberships.length === 1) {
      redirect(`/admin?org=${access.memberships[0]?.organisationSlug}`);
    }

    return (
      <MissingOrganisationState
        availableOrgs={access.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        userEmail={access.user.email ?? null}
      />
    );
  }

  if (access.kind === "unauthorized") {
    return (
      <UnauthorizedState
        availableOrgs={access.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        requestedOrgSlug={access.requestedOrgSlug}
        userEmail={access.user.email ?? null}
      />
    );
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const dashboard = await getAdminDashboard(supabase, access.value.membership.organisationSlug);

  if (!dashboard) {
    return (
      <UnauthorizedState
        availableOrgs={access.value.memberships.map((membership) => ({
          name: membership.organisationName,
          role: membership.role,
          slug: membership.organisationSlug,
        }))}
        requestedOrgSlug={access.value.membership.organisationSlug}
        userEmail={access.value.user.email ?? null}
      />
    );
  }

  return (
    <AdminDashboardShell
      activeSection={activeSection}
      campaignStatus={campaignStatus}
      dashboard={dashboard}
      settingsStatus={settingsStatus}
      userEmail={access.value.user.email ?? null}
      userRole={access.value.membership.role}
    />
  );
}
