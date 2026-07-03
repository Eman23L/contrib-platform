import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { GuestGivingForm } from "@/components/giving/GuestGivingForm";
import { getOrganisationPublicSettings } from "@/lib/organisationSettings";
import { getPublicOrganisation } from "@/lib/services/public/getPublicOrganisation";
import { listPublicFunds } from "@/lib/services/public/listPublicFunds";

type GivePageProps = {
  params: Promise<{ orgSlug: string }>;
};

type IconName =
  | "gift"
  | "heart"
  | "home"
  | "lock"
  | "profile"
  | "receipt"
  | "search"
  | "support";

function Icon({
  className = "h-5 w-5",
  name,
}: {
  className?: string;
  name: IconName;
}) {
  const paths: Record<IconName, ReactNode> = {
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
    lock: (
      <>
        <rect height="11" rx="2" width="18" x="3" y="11" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    support: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.2-3 4" />
        <path d="M12 17h.01" />
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

export default async function GivePage({ params }: GivePageProps) {
  const { orgSlug } = await params;
  const organisation = await getPublicOrganisation(orgSlug);

  if (!organisation) {
    notFound();
  }

  const funds = await listPublicFunds(organisation.id);
  const defaultFund = funds.find((fund) => fund.isDefault) ?? funds[0] ?? null;
  const publicSettings = getOrganisationPublicSettings(
    organisation.settings,
    organisation.name,
  );
  const guestNavItems: Array<{
    href: string;
    icon: IconName;
    label: string;
  }> = [
    { href: `/o/${organisation.slug}/give`, icon: "gift", label: "Give" },
    { href: "/sign-in", icon: "profile", label: "Sign in" },
    { href: "/account", icon: "receipt", label: "My Receipts" },
    { href: `/o/${organisation.slug}`, icon: "home", label: "Organisation" },
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
              {guestNavItems.map((item, index) => (
                <Link
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${index === 0 ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                  href={item.href}
                  key={item.label}
                >
                  <Icon className="h-5 w-5" name={item.icon as IconName} />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-7">
              <div className="rounded-2xl bg-slate-50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon className="h-5 w-5" name="heart" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-950">Giving with purpose.</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {publicSettings.publicPageIntro}
                </p>
              </div>
            </div>
          </aside>

          <div className="min-w-0 bg-[#f8fbff]">
            <header className="flex min-h-20 flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 xl:flex-row xl:items-center xl:justify-between xl:px-9">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white">
                  {organisation.name.slice(0, 1)}
                </span>
                <span className="truncate text-sm font-semibold text-slate-700">
                  {organisation.name}
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm" href="/account">
                  <Icon className="h-4 w-4" name="receipt" />
                  My receipts
                </Link>
                <Link className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600" href="/sign-in">
                  Sign in
                </Link>
              </div>
            </header>

            <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-5 py-3 lg:hidden">
              {guestNavItems.map((item, index) => (
                <Link
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${index === 0 ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                  href={item.href}
                  key={item.label}
                >
                  <Icon className="h-4 w-4" name={item.icon} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="space-y-5 p-5 xl:p-9">
              <div className="grid gap-5 xl:grid-cols-[1fr_350px] xl:items-start">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                    {publicSettings.givingPageHeading}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {publicSettings.givingPageIntro}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                  <div className="flex gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-emerald-500" name="heart" />
                    <p className="text-sm font-medium leading-6 text-slate-700">
                      {publicSettings.publicPageIntro}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon className="h-6 w-6" name="lock" />
                  </span>
                  <h2 className="mt-4 text-sm font-semibold text-slate-950">Secure payment</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Checkout is processed securely through Stripe.</p>
                </article>
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" name="receipt" />
                  </span>
                  <h2 className="mt-4 text-sm font-semibold text-slate-950">Receipt ready</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Add your email to link this gift to your account.</p>
                </article>
                <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon className="h-6 w-6" name="gift" />
                  </span>
                  <h2 className="mt-4 text-sm font-semibold text-slate-950">Simple giving</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Complete your gift in a few focused steps.</p>
                </article>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div>
                  {funds.length === 0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                      Giving is not available for this organisation yet. Please check back soon.
                    </div>
                  ) : (
                    <GuestGivingForm
                      organisation={{
                        organisationName: organisation.name,
                        organisationSlug: organisation.slug,
                        currencyCode: organisation.currencyCode,
                        funds,
                        publicSettings,
                      }}
                    />
                  )}
                </div>

                <aside className="space-y-5">
                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Icon className="h-6 w-6" name="gift" />
                      </span>
                      <div>
                        <h2 className="text-sm font-semibold text-slate-950">Suggested Fund</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {defaultFund?.name ?? "No fund available yet"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <h2 className="text-sm font-semibold text-slate-950">Why create an account?</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Use the same email when giving, then sign in later to see receipts and past contributions.
                    </p>
                    <Link className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600" href="/sign-in">
                      Sign in to view giving
                    </Link>
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <div className="flex gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-emerald-500" name="lock" />
                      <div>
                        <h2 className="text-sm font-semibold text-slate-950">
                          {publicSettings.supportEmail ? "Need help?" : "Protected checkout"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {publicSettings.supportEmail
                            ? `Contact ${publicSettings.supportEmail} for help with gifts or receipts.`
                            : "Your payment details are handled by Stripe. GetFlow stores the giving record for receipts and history."}
                        </p>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
