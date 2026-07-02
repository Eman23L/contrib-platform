import { notFound } from "next/navigation";

import { getOrganisationPublicSettings } from "@/lib/organisationSettings";
import { getPublicOrganisation } from "@/lib/services/public/getPublicOrganisation";
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

function getSuccessPageCopy(status: string) {
  if (status === "succeeded") {
    return {
      heading: "Thank you for your gift",
      intro: "Your payment was completed successfully and recorded for the fund you selected.",
      kicker: "Gift confirmed",
      statusClass: "bg-emerald-100 text-emerald-800",
      statusLabel: "succeeded",
    };
  }

  return {
    heading: "Thank you for giving",
    intro:
      "Your checkout was returned successfully. We are confirming the payment and your receipt will update shortly.",
    kicker: "Gift processing",
    statusClass: "bg-amber-100 text-amber-800",
    statusLabel: "processing",
  };
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

  const organisation = await getPublicOrganisation(orgSlug);
  const publicSettings = organisation
    ? getOrganisationPublicSettings(organisation.settings, organisation.name)
    : null;
  const pageCopy = getSuccessPageCopy(contribution.status);
  const successIntro =
    contribution.status === "succeeded" && publicSettings?.thankYouMessage
      ? publicSettings.thankYouMessage
      : pageCopy.intro;

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-2xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-semibold text-emerald-700">
              OK
            </div>
            <p className="gf-kicker mt-6">
              {pageCopy.kicker}
            </p>
            <h1 className="gf-title mt-3">
              {pageCopy.heading}
            </h1>
            <p className="gf-copy mt-3 max-w-md">
              {successIntro}
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
                <dd
                  className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${pageCopy.statusClass}`}
                >
                  {pageCopy.statusLabel}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
