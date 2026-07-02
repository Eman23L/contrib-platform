import Link from "next/link";
import type { ReactNode } from "react";

type AdminDashboardChromeProps = {
  activeSection:
    | "campaigns"
    | "funds"
    | "giving"
    | "overview"
    | "reports"
    | "settings"
    | "supporters"
    | "team";
  children: ReactNode;
  organisationName: string;
  organisationSlug: string;
  userEmail: string | null;
};

type IconName =
  | "calendar"
  | "campaign"
  | "chart"
  | "gift"
  | "home"
  | "settings"
  | "support"
  | "team"
  | "wallet";

function Icon({
  className = "h-5 w-5",
  name,
}: {
  className?: string;
  name: IconName;
}) {
  const paths: Record<IconName, ReactNode> = {
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

export function AdminDashboardChrome({
  activeSection,
  children,
  organisationName,
  organisationSlug,
  userEmail,
}: AdminDashboardChromeProps) {
  const orgParam = `?org=${organisationSlug}`;
  const firstName = userEmail?.split("@")[0] ?? "Admin";
  const navItems: Array<{
    href: string;
    icon: IconName;
    id: AdminDashboardChromeProps["activeSection"];
    label: string;
  }> = [
    { href: `/admin${orgParam}`, icon: "home", id: "overview", label: "Overview" },
    { href: `/admin/contributions${orgParam}`, icon: "gift", id: "giving", label: "Giving" },
    { href: `/admin${orgParam}&section=supporters`, icon: "support", id: "supporters", label: "Supporters" },
    { href: `/admin${orgParam}&section=funds`, icon: "wallet", id: "funds", label: "Funds" },
    { href: `/admin${orgParam}&section=campaigns`, icon: "campaign", id: "campaigns", label: "Campaigns" },
    { href: `/admin${orgParam}&section=reports`, icon: "chart", id: "reports", label: "Reports" },
    { href: `/admin${orgParam}&section=team`, icon: "team", id: "team", label: "Team" },
    { href: `/admin${orgParam}&section=settings`, icon: "settings", id: "settings", label: "Settings" },
  ];

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
              {navItems.map((item) => {
                const isActive = item.id === activeSection;

                return (
                  <Link
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    href={item.href}
                    key={item.id}
                  >
                    <Icon className="h-5 w-5" name={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Need help?</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Support contact details are managed in organisation settings.
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 bg-[#f8fafc]">
            <header className="flex min-h-20 flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" name="home" />
                </span>
                <span className="truncate rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  {organisationName}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  <Icon className="h-4 w-4 text-slate-500" name="calendar" />
                  Current dashboard
                </span>
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600" href={`/admin/contributions${orgParam}`}>
                  <Icon className="h-4 w-4" name="gift" />
                  View giving
                </Link>
                <form action="/auth/sign-out" method="post">
                  <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" type="submit">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-xs font-bold text-slate-700">
                      {firstName.slice(0, 1).toUpperCase()}
                    </span>
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </header>

            <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
              {navItems.map((item) => {
                const isActive = item.id === activeSection;

                return (
                  <Link
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    href={item.href}
                    key={item.id}
                  >
                    <Icon className="h-4 w-4" name={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
