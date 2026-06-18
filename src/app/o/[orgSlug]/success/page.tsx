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
    <main className="gf-page">
      <div className="gf-shell max-w-2xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700">
              OK
            </div>
            <p className="gf-kicker mt-6">
              Gift confirmed
            </p>
            <h1 className="gf-title mt-3">
              Thank you for your gift
            </h1>
            <p className="gf-copy mt-3 max-w-md">
              Your payment was completed successfully and recorded for the
              fund you selected.
            </p>
          </div>

          <div className="gf-card-soft mt-8 p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-[#5f7f66]">
                  Organisation
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950">
                  {contribution.organisationName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5f7f66]">
                  Fund
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950">
                  {contribution.fundName ?? "General contribution"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5f7f66]">
                  Amount
                </dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950">
                  {formatAmount(contribution.amountMinor, contribution.currencyCode)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5f7f66]">
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
