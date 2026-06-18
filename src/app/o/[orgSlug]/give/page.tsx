import { notFound } from "next/navigation";

import { GuestGivingForm } from "@/components/giving/GuestGivingForm";
import { getPublicOrganisation } from "@/lib/services/public/getPublicOrganisation";
import { listPublicFunds } from "@/lib/services/public/listPublicFunds";

type GivePageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function GivePage({ params }: GivePageProps) {
  const { orgSlug } = await params;
  const organisation = await getPublicOrganisation(orgSlug);

  if (!organisation) {
    notFound();
  }

  const funds = await listPublicFunds(organisation.id);

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-2xl">
        <section className="gf-frame">
          <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.94)_0%,_rgba(240,253,244,0.82)_48%,_rgba(239,246,255,0.82)_100%)] px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-[#7ca982] text-2xl font-semibold text-white shadow-[0_14px_34px_rgba(124,169,130,0.32)] sm:h-[4.5rem] sm:w-[4.5rem]">
                {organisation.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="gf-kicker">
                  Thank you for supporting this community
                </p>
                <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Support {organisation.name}
                </h1>
                <p className="gf-copy mt-3 max-w-xl">
                  Choose where your gift should go, add an amount, and continue
                  to a secure checkout.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm">
                <span className="block font-medium text-slate-900">Secure payment</span>
                <span className="mt-1 block">Processed securely</span>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm">
                <span className="block font-medium text-slate-900">Receipt optional</span>
                <span className="mt-1 block">Add your email below</span>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm">
                <span className="block font-medium text-slate-900">Simple giving</span>
                <span className="mt-1 block">A few calm steps</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {funds.length === 0 ? (
              <div className="rounded-3xl border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                Giving is not available for this organisation yet. Please check
                back soon.
              </div>
            ) : (
              <GuestGivingForm
                organisation={{
                  organisationName: organisation.name,
                  organisationSlug: organisation.slug,
                  currencyCode: organisation.currencyCode,
                  funds,
                }}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
