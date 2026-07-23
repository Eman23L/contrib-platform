import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { GuestGivingForm } from "@/components/giving/GuestGivingForm";
import {
  getSupporterGivingHistory,
  type SupporterGivingHistoryItem,
} from "@/lib/services/account/getSupporterGivingHistory";
import { getOrganisationPublicSettings } from "@/lib/organisationSettings";
import { getOrganisationBySlug } from "@/lib/db/queries/organisations";
import { listPublicFunds } from "@/lib/services/public/listPublicFunds";
import type { PublicGivingPageData } from "@/types/api";
import {
  createServerSupabaseServiceClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";

type AccountSection =
  | "giving"
  | "home"
  | "profile"
  | "receipts"
  | "recurring"
  | "support";

type AccountPageProps = {
  searchParams: Promise<{ org?: string; period?: string; section?: string }>;
};

type IconName =
  | "document"
  | "gift"
  | "heart"
  | "home"
  | "profile"
  | "receipt"
  | "refresh"
  | "support"
  | "users";

function Icon({
  className = "h-5 w-5",
  name,
}: {
  className?: string;
  name: IconName;
}) {
  const paths: Record<IconName, ReactNode> = {
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
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
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    profile: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
    support: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.2-3 4" />
        <path d="M12 17h.01" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function formatAmount(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "succeeded":
      return "Paid";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "succeeded":
      return "bg-emerald-100 text-emerald-700";
    case "failed":
      return "bg-rose-100 text-rose-700";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getFirstName(
  email: string | null | undefined,
  metadata?: Record<string, unknown>,
) {
  const metadataFirstName = metadata?.first_name;

  if (typeof metadataFirstName === "string" && metadataFirstName.trim()) {
    return metadataFirstName.trim();
  }

  const localPart = email?.split("@")[0] ?? "there";
  const firstSegment = localPart.split(/[._-]/)[0] || localPart;

  return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
}

function getCurrencyCode(history: SupporterGivingHistoryItem[]) {
  return history[0]?.currencyCode ?? "GBP";
}

function getReceiptHref(item: SupporterGivingHistoryItem) {
  if (!item.checkoutSessionId || !item.organisationSlug) {
    return null;
  }

  return `/o/${item.organisationSlug}/success?session_id=${encodeURIComponent(item.checkoutSessionId)}`;
}

function getGivingHrefForHistoryItem(
  item: SupporterGivingHistoryItem,
  fallbackHref: string | null,
) {
  return item.organisationSlug
    ? `/o/${item.organisationSlug}/give`
    : fallbackHref;
}

function OrganisationGivingLink({
  fallbackHref,
  item,
}: {
  fallbackHref: string | null;
  item: SupporterGivingHistoryItem;
}) {
  const href = getGivingHrefForHistoryItem(item, fallbackHref);
  const content = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-xs font-bold text-white">
        {item.organisationName.slice(0, 1)}
      </span>
      {item.organisationName}
    </>
  );

  if (!href) {
    return <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">{content}</span>;
  }

  return (
    <Link className="flex items-center gap-3 text-sm font-semibold text-slate-700" href={href}>
      {content}
    </Link>
  );
}

function getAccountSection(section?: string): AccountSection {
  if (
    section === "giving" ||
    section === "profile" ||
    section === "receipts" ||
    section === "recurring" ||
    section === "support"
  ) {
    return section;
  }

  return "home";
}

function getSectionTitle(section: AccountSection) {
  switch (section) {
    case "giving":
      return "My Giving";
    case "profile":
      return "Profile";
    case "receipts":
      return "Receipts";
    case "recurring":
      return "Recurring Gifts";
    case "support":
      return "Support";
    default:
      return "Home";
  }
}

function StatCard({
  detail,
  icon,
  label,
  value,
  variant,
}: {
  detail: string;
  icon: IconName;
  label: string;
  value: string;
  variant: "blue" | "emerald";
}) {
  const accent =
    variant === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-blue-50 text-blue-600";

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${accent}`}>
          <Icon className="h-7 w-7" name={icon} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
      </div>
    </article>
  );
}

function RecentContributionsTable({
  giveAgainHref,
  history,
}: {
  giveAgainHref: string | null;
  history: SupporterGivingHistoryItem[];
}) {
  const rows = history.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">Recent Contributions</h2>
        <Link className="text-sm font-semibold text-blue-600" href="/account?section=giving">
          View all
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="border-t border-slate-100 px-5 py-10">
          <h3 className="text-base font-semibold text-slate-950">No contributions yet</h3>
          <p className="mt-2 text-sm text-slate-500">Open an organisation public giving page to make your first gift.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-3">Organization</th>
                  <th className="px-5 py-3">Fund</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <OrganisationGivingLink fallbackHref={giveAgainHref} item={item} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.fundName}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                      {formatAmount(item.amountMinor, item.currencyCode)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.dateLabel}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(item.paymentStatus)}`}>
                        {getStatusLabel(item.paymentStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 border-t border-slate-100 p-4 md:hidden">
            {rows.map((item) => (
              <article className="rounded-xl border border-slate-100 bg-slate-50 p-4" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{item.organisationName}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.fundName}</p>
                  </div>
                  <p className="font-semibold text-slate-950">
                    {formatAmount(item.amountMinor, item.currencyCode)}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">{item.dateLabel}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(item.paymentStatus)}`}>
                    {getStatusLabel(item.paymentStatus)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SectionContent({
  currencyCode,
  email,
  firstName,
  giveAgainHref,
  givingPageData,
  history,
  latestGift,
  section,
  supportEmail,
  supportOrganisationName,
  totalGiven,
  period,
  yearGiftCount,
}: {
  currencyCode: string;
  email: string | null;
  firstName: string;
  giveAgainHref: string | null;
  givingPageData: PublicGivingPageData | null;
  history: SupporterGivingHistoryItem[];
  latestGift: SupporterGivingHistoryItem | null;
  section: AccountSection;
  supportEmail: string;
  supportOrganisationName: string | null;
  totalGiven: number;
  period: "month" | "year";
  yearGiftCount: number;
}) {
  if (section === "home") {
    return (
      <>
        <div className="grid gap-5 xl:grid-cols-[1fr_350px] xl:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Hi, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Choose where you would like to give, then review your giving below.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <div className="flex gap-3">
              <Icon className="h-5 w-5 shrink-0 text-emerald-500" name="heart" />
              <p className="text-sm font-medium leading-6 text-slate-700">
                Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <StatCard
            detail="Across all funds, this year"
            icon="gift"
            label="Total Given This Year"
            value={formatAmount(totalGiven, currencyCode)}
            variant="emerald"
          />
          <StatCard
            detail="This year"
            icon="heart"
            label="Gifts Made"
            value={yearGiftCount.toLocaleString("en-GB")}
            variant="blue"
          />
          <StatCard
            detail={latestGift ? `${latestGift.dateLabel} - ${getStatusLabel(latestGift.paymentStatus)}` : "No gifts recorded yet"}
            icon="refresh"
            label="Latest Gift"
            value={latestGift ? formatAmount(latestGift.amountMinor, latestGift.currencyCode) : "None"}
            variant="emerald"
          />
        </div>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Ways to give</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a fund for your next contribution.</p>
          </div>
          {givingPageData ? (
            <div className="mt-5">
              <GuestGivingForm organisation={givingPageData} />
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Giving options will appear here when an organisation is connected to your account.
            </p>
          )}
        </section>

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <RecentContributionsTable giveAgainHref={giveAgainHref} history={history} />

            <div className="grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" name="heart" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-slate-950">Give Again</h2>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                  {latestGift
                    ? `Support ${latestGift.organisationName} again.`
                    : "Support the mission and ministry that matter most."}
                </p>
                {giveAgainHref ? (
                  <Link className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600" href={giveAgainHref}>
                    {latestGift?.fundName ? `Give to ${latestGift.fundName}` : "Give again"}
                  </Link>
                ) : null}
              </article>
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon className="h-6 w-6" name="gift" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-slate-950">Support Another Fund</h2>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                  Choose a fund to make a one-time donation.
                </p>
                {giveAgainHref ? (
                  <Link className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700" href={giveAgainHref}>
                    Explore Funds
                  </Link>
                ) : null}
              </article>
            </div>
          </div>

          <AccountAside
            currencyCode={currencyCode}
            latestGift={latestGift}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {getSectionTitle(section)}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {section === "giving"
            ? "Review your gifts and giving history."
            : section === "receipts"
              ? "Find receipts for completed gifts."
              : section === "recurring"
                ? "Review whether recurring gifts are connected to this account."
                : section === "profile"
                  ? "Review your account and communication preferences."
                  : "Get help with giving, receipts, and your account."}
        </p>
      </div>

      {section === "giving" ? (
        <>
          <form className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between" method="get">
            <input name="section" type="hidden" value="giving" />
            {givingPageData ? <input name="org" type="hidden" value={givingPageData.organisationSlug} /> : null}
            <label className="text-sm font-semibold text-slate-700" htmlFor="giving-period">View giving by</label>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700" defaultValue={period} id="giving-period" name="period">
              <option value="year">This year</option>
              <option value="month">This month</option>
            </select>
          </form>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard detail={`Across all funds, ${period === "month" ? "this month" : "this year"}`} icon="gift" label={`Total Given ${period === "month" ? "This Month" : "This Year"}`} value={formatAmount(totalGiven, currencyCode)} variant="emerald" />
            <StatCard detail={period === "month" ? "This month" : "This year"} icon="heart" label="Gifts Made" value={yearGiftCount.toLocaleString("en-GB")} variant="blue" />
            <StatCard detail={latestGift ? `${latestGift.dateLabel} - ${getStatusLabel(latestGift.paymentStatus)}` : "No gifts recorded yet"} icon="refresh" label="Latest Gift" value={latestGift ? formatAmount(latestGift.amountMinor, latestGift.currencyCode) : "None"} variant="emerald" />
          </div>
          <RecentContributionsTable giveAgainHref={giveAgainHref} history={history} />
        </>
      ) : null}

      {section === "receipts" ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">Receipts</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {history.filter((item) => item.paymentStatus === "succeeded").length > 0 ? history.filter((item) => item.paymentStatus === "succeeded").map((item) => {
              const receiptHref = getReceiptHref(item);

              return (
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                  <div>
                    <p className="font-semibold text-slate-950">{item.organisationName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.fundName} - {item.dateLabel} - {formatAmount(item.amountMinor, item.currencyCode)}
                    </p>
                  </div>
                  {receiptHref ? (
                    <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600" href={receiptHref}>
                      <Icon className="h-4 w-4" name="receipt" />
                      View receipt
                    </Link>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500">
                      Receipt pending
                    </span>
                  )}
                </div>
              );
            }) : (
              <p className="px-5 py-8 text-sm text-slate-500">No paid receipts are available yet.</p>
            )}
          </div>
        </section>
      ) : null}

      {section === "recurring" ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon className="h-7 w-7" name="refresh" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-950">Recurring Gift</h2>
              <p className="mt-1 text-sm text-slate-500">
                No recurring gifts are recorded for this account. Current giving history contains one-time contribution records.
              </p>
            </div>
          </div>
          {giveAgainHref ? (
            <Link className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white" href={giveAgainHref}>
              Make a one-time gift
            </Link>
          ) : null}
        </section>
      ) : null}

      {section === "profile" ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Icon className="h-6 w-6" name="profile" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-950">Your Profile</h2>
              <p className="mt-1 truncate text-sm text-slate-500">{email ?? "your account"}</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Communication preferences</p>
            <p className="mt-1 text-sm text-slate-500">Receipts, updates, and reminders by email</p>
          </div>
        </section>
      ) : null}

      {section === "support" ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <h2 className="text-base font-semibold text-slate-950">Support</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {supportOrganisationName
              ? `For help with gifts, receipts, or account access, contact ${supportOrganisationName}.`
              : "Choose an organisation to see its giving and support details."}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {supportEmail ? (
              <a className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600" href={`mailto:${supportEmail}`}>
                Email {supportEmail}
              </a>
            ) : null}
            {giveAgainHref ? (
              <Link className="inline-flex rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600" href={giveAgainHref}>
                Go to giving page
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

function AccountAside({
  currencyCode,
  latestGift,
}: {
  currencyCode: string;
  latestGift: SupporterGivingHistoryItem | null;
}) {
  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon className="h-7 w-7" name="gift" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-950">Latest Contribution</h2>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {latestGift ? formatAmount(latestGift.amountMinor, latestGift.currencyCode) : formatAmount(0, currencyCode)}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Date</dt>
            <dd className="mt-1 font-semibold text-slate-800">{latestGift ? latestGift.dateLabel : "No gifts yet"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-1 font-semibold text-slate-800">{latestGift ? getStatusLabel(latestGift.paymentStatus) : "None"}</dd>
          </div>
        </dl>
        <Link className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white" href="/account?section=giving">
          View Giving History
        </Link>
      </section>

    </aside>
  );
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { org, period: requestedPeriod, section } = await searchParams;
  const activeSection = getAccountSection(section);
  const period: "month" | "year" = requestedPeriod === "month" ? "month" : "year";
  const authenticatedUser = await getAuthenticatedServerUser();

  if (!authenticatedUser) {
    redirect("/sign-in");
  }

  const supabase = createServerSupabaseServiceClient();
  const history = await getSupporterGivingHistory(supabase, {
    email: authenticatedUser.user.email?.trim().toLowerCase() ?? null,
    userId: authenticatedUser.user.id,
  });
  const requestedOrganisationSlug = typeof org === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(org)
    ? org
    : null;
  const inferredOrganisationSlug = history.find((item) => item.organisationSlug)?.organisationSlug ?? null;
  const organisationSlug = requestedOrganisationSlug ?? inferredOrganisationSlug;
  const inferredOrganisation = organisationSlug
    ? await getOrganisationBySlug(supabase, organisationSlug)
    : null;
  const inferredPublicSettings = inferredOrganisation
    ? getOrganisationPublicSettings(
        inferredOrganisation.settings,
        inferredOrganisation.name,
      )
    : null;

  const giveAgainHref = inferredOrganisationSlug ? `/o/${inferredOrganisationSlug}/give` : null;
  const organisationGiveHref = organisationSlug ? `/o/${organisationSlug}/give` : null;
  const funds = inferredOrganisation ? await listPublicFunds(inferredOrganisation.id) : [];
  const givingPageData: PublicGivingPageData | null = inferredOrganisation && inferredPublicSettings
    ? {
        organisationName: inferredOrganisation.name,
        organisationSlug: inferredOrganisation.slug,
        currencyCode: inferredOrganisation.currencyCode,
        funds,
        publicSettings: inferredPublicSettings,
      }
    : null;
  const currencyCode = getCurrencyCode(history);
  const currentYear = new Date().getUTCFullYear();
  const paidHistory = history.filter((item) => item.paymentStatus === "succeeded");
  const now = new Date();
  const periodHistory = history.filter((item) => {
    const createdAt = new Date(item.createdAt);

    return period === "month"
      ? createdAt.getUTCFullYear() === now.getUTCFullYear() && createdAt.getUTCMonth() === now.getUTCMonth()
      : createdAt.getUTCFullYear() === currentYear;
  });
  const periodPaidHistory = periodHistory.filter((item) => item.paymentStatus === "succeeded");
  const totalGiven = paidHistory
    .filter((item) => periodPaidHistory.some((periodItem) => periodItem.id === item.id))
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const latestGift = activeSection === "giving" ? periodHistory[0] ?? null : history[0] ?? null;
  const firstName = getFirstName(
    authenticatedUser.user.email,
    authenticatedUser.user.user_metadata,
  );
  const yearGiftCount = periodPaidHistory.length;
  const accountHomeHref = organisationSlug ? `/account?org=${encodeURIComponent(organisationSlug)}` : "/account";
  const accountGivingHref = organisationSlug
    ? `/account?org=${encodeURIComponent(organisationSlug)}&section=giving`
    : "/account?section=giving";
  const accountNavItems: Array<{
    href: string;
    icon: IconName;
    id: AccountSection;
    label: string;
  }> = [
    { href: accountHomeHref, icon: "home", id: "home", label: "Home" },
    { href: accountGivingHref, icon: "heart", id: "giving", label: "My Giving" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f9fd] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[calc(100vh-2.5rem)] max-w-[1440px] overflow-hidden border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.10)]">
        <div className="grid min-h-[calc(100vh-2.5rem)] lg:grid-cols-[230px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
            <div className="flex h-20 items-center gap-3 px-7">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500 text-sm font-bold text-blue-600">G</span>
              <span className="text-xl font-semibold tracking-tight text-blue-600">GetFlow</span>
            </div>
            <nav className="flex-1 space-y-3 px-5 py-6">
              {accountNavItems.map((item) => {
                const isActive = item.id === activeSection;

                return (
                  <Link
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                    href={item.href}
                    key={item.id}
                  >
                    <Icon className="h-5 w-5" name={item.icon as IconName} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-7">
              <div className="rounded-2xl bg-slate-50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" name="heart" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-950">Giving with purpose.</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Thank you for being part of something bigger.
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 bg-[#f8fbff]">
            <header className="flex min-h-20 flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-9">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white">
                  G
                </span>
                <span className="truncate text-sm font-semibold text-slate-700">
                  {history[0]?.organisationName ?? "Your account"}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <form action="/auth/sign-out" method="post">
                  <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50" type="submit">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-slate-700">
                      {firstName.slice(0, 1)}
                    </span>
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </header>

            <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
              {accountNavItems.map((item) => {
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

            <div className="space-y-5 p-5 xl:p-9">
              <SectionContent
                currencyCode={currencyCode}
                email={authenticatedUser.user.email ?? null}
                firstName={firstName}
                giveAgainHref={giveAgainHref ?? organisationGiveHref}
                givingPageData={givingPageData}
                history={activeSection === "giving" ? periodHistory : history}
                latestGift={latestGift}
                period={period}
                section={activeSection}
                supportEmail={inferredPublicSettings?.supportEmail ?? ""}
                supportOrganisationName={inferredOrganisation?.name ?? history[0]?.organisationName ?? null}
                totalGiven={totalGiven}
                yearGiftCount={yearGiftCount}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
