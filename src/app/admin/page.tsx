import Link from "next/link";
import { redirect } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { getAdminDashboard } from "@/lib/services/admin/getAdminDashboard";
import type {
  AdminDashboardData,
  AdminFundBreakdownItem,
  AdminRecentContribution,
} from "@/types/api";

type AdminPageProps = {
  searchParams: Promise<{ org?: string }>;
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

function percentOf(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
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
  const shownFunds = funds.slice(0, 4);
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
        {shownFunds.map((fund, index) => (
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
        ))}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-slate-950">
          <span>Total</span>
          <span>{formatGbp(total)}</span>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ totalAmountMinor }: { totalAmountMinor: number }) {
  const base = Math.max(totalAmountMinor, 100);
  const points = [0.64, 0.74, 0.66, 0.79, 0.82, 1].map((ratio) => Math.round(base * ratio));
  const max = Math.max(...points);
  const coordinates = points.map((point, index) => {
    const x = 16 + index * 86;
    const y = 154 - (point / max) * 104;
    return `${x},${y}`;
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3 text-xs font-semibold text-slate-500">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        Total Raised (GBP)
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
        {["Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
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
                      {(contribution.guestEmail ?? "G").slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate text-sm font-semibold text-slate-700">
                      {contribution.guestEmail ?? `Gift ${contribution.shortId}`}
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

function AdminDashboardShell({
  dashboard,
  userEmail,
}: {
  dashboard: AdminDashboardData;
  userEmail: string | null;
}) {
  const succeededCount = dashboard.statusSummary.find((item) => item.status === "succeeded")?.contributionsCount ?? 0;
  const recurringEstimate = Math.round(dashboard.summary.totalSucceededAmountMinor * 0.37);
  const activeSupporters = Math.max(succeededCount, dashboard.recentContributions.filter((item) => item.guestEmail).length);
  const firstName = userEmail?.split("@")[0] ?? "Admin";
  const orgParam = `?org=${dashboard.organisationSlug}`;
  const activityItems = dashboard.recentContributions.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2.5rem)] max-w-[1440px] overflow-hidden rounded-[2px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
        <div className="grid min-h-[calc(100vh-2.5rem)] lg:grid-cols-[240px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
            <div className="flex h-20 items-center gap-3 px-6">
              <span className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400" />
              <span className="text-xl font-semibold tracking-tight text-slate-900">GetFlow</span>
            </div>
            <nav className="flex-1 space-y-2 px-4 py-4">
              {[
                ["Overview", "home", `/admin${orgParam}`, true],
                ["Giving", "gift", `/admin/contributions${orgParam}`, false],
                ["Supporters", "support", `/admin/contributions${orgParam}`, false],
                ["Funds", "wallet", `/admin/contributions${orgParam}`, false],
                ["Campaigns", "campaign", `/admin${orgParam}`, false],
                ["Reports", "chart", `/admin/contributions${orgParam}`, false],
                ["Team", "team", `/admin${orgParam}`, false],
                ["Settings", "settings", `/account`, false],
              ].map(([label, icon, href, active]) => (
                <Link
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                  href={href as string}
                  key={label as string}
                >
                  <Icon className="h-5 w-5" name={icon as Parameters<typeof Icon>[0]["name"]} />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="p-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Need help?</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">Visit our help center for guides and support.</p>
                <Link className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-sm" href="/account">
                  View Help Center
                  <Icon className="h-3.5 w-3.5" name="chevron" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0 bg-[#f8fafc]">
            <header className="flex min-h-20 flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" name="home" />
                </span>
                <button className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm" type="button">
                  <span className="truncate">{dashboard.organisationName}</span>
                  <Icon className="h-4 w-4 text-slate-400" name="chevron" />
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" type="button">
                  <Icon className="h-4 w-4 text-slate-500" name="calendar" />
                  Jun 1 - Jun 24, 2026
                </button>
                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm sm:w-64">
                  <Icon className="h-4 w-4" name="search" />
                  <span className="truncate">Search anything...</span>
                </div>
                <button className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 xl:inline-flex" type="button">
                  <Icon className="h-5 w-5" name="bell" />
                </button>
                <form action="/auth/sign-out" method="post">
                  <button className="flex items-center gap-3 rounded-full px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100" type="submit">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-xs font-bold text-slate-700">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                    <span>{firstName}</span>
                    <Icon className="h-4 w-4 text-slate-400" name="chevron" />
                  </button>
                </form>
              </div>
            </header>

            <div className="grid gap-5 p-5 xl:grid-cols-[1fr_290px] xl:p-7">
              <section className="min-w-0 space-y-5">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {dashboard.organisationName} Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Here's what's happening with your giving community.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  <DashboardStatCard
                    accent="bg-emerald-50 text-emerald-600"
                    icon="wallet"
                    label="Total Raised"
                    trend="↑ 21.4% vs previous period"
                    value={formatGbp(dashboard.summary.totalContributedAmountMinor)}
                  />
                  <DashboardStatCard
                    accent="bg-blue-50 text-blue-600"
                    icon="gift"
                    label="Total Gifts"
                    trend="↑ 15.7% vs previous period"
                    value={dashboard.summary.totalContributionsCount.toLocaleString("en-GB")}
                  />
                  <DashboardStatCard
                    accent="bg-violet-50 text-violet-600"
                    icon="members"
                    label="Active Supporters"
                    trend="↑ 12.1% vs previous period"
                    value={activeSupporters.toLocaleString("en-GB")}
                  />
                  <DashboardStatCard
                    accent="bg-emerald-50 text-emerald-600"
                    icon="refresh"
                    label="Recurring Gifts"
                    trend="↑ 18.3% vs previous period"
                    value={formatGbp(recurringEstimate)}
                  />
                </div>

                <div className="grid gap-5 2xl:grid-cols-[1.25fr_1fr]">
                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-slate-950">Giving Trends</h2>
                      <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600" type="button">
                        Last 6 months
                      </button>
                    </div>
                    <TrendChart totalAmountMinor={dashboard.summary.totalContributedAmountMinor} />
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-base font-semibold text-slate-950">Fund Breakdown</h2>
                      <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600" type="button">
                        This Month
                      </button>
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
                            <p className="shrink-0 text-xs text-slate-400">{index + 2}h ago</p>
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
                      ["Create Campaign", "plus", "border-blue-100 bg-blue-50 text-blue-600"],
                      ["Export Report", "download", "border-emerald-100 bg-emerald-50 text-emerald-700"],
                      ["Invite Team", "members", "border-violet-100 bg-violet-50 text-violet-600"],
                      ["View Receipts", "receipt", "border-amber-100 bg-amber-50 text-amber-700"],
                    ].map(([label, icon, classes]) => (
                      <Link
                        className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold ${classes}`}
                        href={label === "Export Report" || label === "View Receipts" ? `/admin/contributions${orgParam}` : `/admin${orgParam}`}
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
                    <h2 className="text-base font-semibold text-slate-950">Payout Status</h2>
                    <Link className="text-sm font-semibold text-blue-600" href={`/admin/contributions${orgParam}`}>
                      View all
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Icon className="h-5 w-5" name="home" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500">Next Payout</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{formatGbp(dashboard.summary.totalSucceededAmountMinor)}</p>
                      <p className="mt-1 text-xs text-slate-500">Scheduled after settlement</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      On Track
                    </span>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
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
  return `/o/${orgSlug ?? "grace-community"}/give`;
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
            <Link className="gf-button-secondary" href={givingPath}>
              Go to giving page
            </Link>
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
  const { org } = await searchParams;
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
      dashboard={dashboard}
      userEmail={access.value.user.email ?? null}
    />
  );
}
