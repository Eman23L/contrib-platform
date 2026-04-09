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
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f5efe2_0%,_#f8f6f1_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-xl">
        <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 shadow-[0_24px_70px_rgba(20,83,45,0.12)] backdrop-blur sm:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-2xl font-semibold text-white">
              {organisation.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                Give securely
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
                {organisation.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-black/60">
                Simple QR-first giving for offerings, tithe, and special campaigns.
              </p>
            </div>
          </div>

          {funds.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              No active funds are available for this organisation yet.
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
        </section>
      </div>
    </main>
  );
}
