import { notFound } from "next/navigation";

import { getContributionBySessionId } from "@/lib/services/public/getContributionBySessionId";

type SuccessPageProps = {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

function formatAmount(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const [{ orgSlug }, { session_id: sessionId }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!sessionId) {
    notFound();
  }

  const contribution = await getContributionBySessionId(sessionId);

  if (!contribution || contribution.organisationSlug !== orgSlug) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#eef7ef_0%,_#f8f6f1_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-emerald-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(22,101,52,0.14)] backdrop-blur sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700">
              OK
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Contribution confirmed
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Thank you for your contribution
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-black/65 sm:text-base">
              Your payment was completed successfully and has been recorded for the
              selected fund.
            </p>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[linear-gradient(180deg,_rgba(243,248,244,0.95)_0%,_rgba(255,255,255,0.95)_100%)] p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Organisation
                </dt>
                <dd className="mt-1 text-lg font-semibold text-ink">
                  {contribution.organisationName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Fund
                </dt>
                <dd className="mt-1 text-lg font-semibold text-ink">
                  {contribution.fundName ?? "General contribution"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Amount
                </dt>
                <dd className="mt-1 text-lg font-semibold text-ink">
                  {formatAmount(contribution.amountMinor, contribution.currencyCode)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Status
                </dt>
                <dd className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                  succeeded
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
