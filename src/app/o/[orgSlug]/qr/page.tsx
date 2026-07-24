import { notFound } from "next/navigation";
import QRCode from "qrcode";

import { getConfiguredAppOrigin } from "@/lib/auth/urls";
import { getPublicOrganisation } from "@/lib/services/public/getPublicOrganisation";

type OrganisationQrPageProps = {
  params: Promise<{ orgSlug: string }>;
};

function getAppOrigin() {
  return getConfiguredAppOrigin() ?? "https://getflow.thetechbuilder.co.uk";
}

function getPlainUrl(url: string) {
  return url.replace(/^https?:\/\//, "");
}

export default async function OrganisationQrPage({
  params,
}: OrganisationQrPageProps) {
  const { orgSlug } = await params;
  const organisation = await getPublicOrganisation(orgSlug);

  if (!organisation) {
    notFound();
  }

  const givingUrl = `${getAppOrigin()}/o/${organisation.slug}`;
  const qrSvg = await QRCode.toString(givingUrl, {
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
    margin: 1,
    type: "svg",
    width: 360,
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/70 p-8 shadow-2xl sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_420px] lg:items-center">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Scan to give
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {organisation.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              Scan the QR code with your phone, then enter your name and email to
              continue securely.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Giving link
              </p>
              <p className="mt-3 break-all text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {getPlainUrl(givingUrl)}
              </p>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[420px] rounded-[2rem] bg-white p-6 text-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.45)] sm:p-8">
            <div
              className="mx-auto aspect-square w-full max-w-[360px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <p className="mt-6 text-center text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Open on your phone
            </p>
            <p className="mt-2 text-center text-lg font-semibold text-slate-950">
              {getPlainUrl(givingUrl)}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
