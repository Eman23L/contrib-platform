import Link from "next/link";
import { notFound } from "next/navigation";

import { SignInForm } from "@/components/auth/SignInForm";
import { getPublicOrganisation } from "@/lib/services/public/getPublicOrganisation";

type OrganisationLandingPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function OrganisationLandingPage({
  params,
}: OrganisationLandingPageProps) {
  const { orgSlug } = await params;
  const organisation = await getPublicOrganisation(orgSlug);

  if (!organisation) {
    notFound();
  }

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-5xl">
        <section className="gf-frame grid gap-4 p-3 sm:p-4 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="gf-card p-6 sm:p-8">
            <p className="gf-kicker">
              GetFlow
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Welcome to {organisation.name}
            </h1>
            <p className="mt-4 text-lg font-medium text-slate-700">
              Give securely, sign in, or continue as a guest.
            </p>
            <p className="gf-copy mt-6 max-w-xl">
              Your gift helps support the work of this community. Choose a fund,
              send yourself a receipt, or sign in to manage your giving.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="gf-card-soft px-4 py-4">
                <p className="text-sm font-medium text-[#5f7f66]">
                  Giving
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">Secure checkout</p>
              </div>
              <div className="gf-card-soft px-4 py-4">
                <p className="text-sm font-medium text-[#5f7f66]">
                  Community
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">{organisation.name}</p>
              </div>
              <div className="gf-card-soft px-4 py-4">
                <p className="text-sm font-medium text-[#5f7f66]">
                  Receipt
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">Email optional</p>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <section className="gf-card w-full p-6 sm:p-8">
              <p className="gf-kicker">
                Welcome
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Sign in to manage your giving
              </h2>
              <p className="gf-copy mt-3">
                We will send a secure link to your email.
              </p>

              <div className="mt-6">
                <SignInForm
                  buttonText="Sign in"
                  inputLabel="Email address"
                  nextPath={`/o/${organisation.slug}`}
                  placeholder="you@example.com"
                  successMessage="Check your email for your secure GetFlow link."
                />
              </div>

              <div className="mt-6 text-center">
                <Link
                  className="gf-link"
                  href={`/o/${organisation.slug}/give`}
                >
                  Continue as guest
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
