import Link from "next/link";

const LAST_UPDATED = "29 September 2026";

export const metadata = {
  description: "How GetFlow collects, uses, and protects your information.",
  title: "Privacy Policy — GetFlow",
};

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="gf-page">
      <div className="gf-shell max-w-3xl">
        <section className="gf-card w-full p-6 sm:p-8">
          <p className="gf-kicker">GetFlow</p>
          <h1 className="gf-title mt-3">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated {LAST_UPDATED}</p>
          <p className="gf-copy mt-4">
            This policy explains what information GetFlow collects when you give to or
            sign in with an organisation using this platform, why we collect it, and how
            it is protected. It applies to every organisation&apos;s giving page hosted
            on GetFlow.
          </p>

          <Section title="Information we collect">
            <p>When you give or sign in, we may collect:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Your name and email address, whether you give as a guest or with an account.</li>
              <li>
                The gift amount, fund or campaign, date, and frequency (one-time or
                monthly) — but never your card or bank details. Those are entered
                directly with Stripe, our payment processor, and never reach GetFlow&apos;s
                servers.
              </li>
              <li>
                Where an organisation offers Gift Aid, whether you have declared
                eligibility, so the organisation can claim it from HMRC.
              </li>
              <li>Basic technical information (like IP address) used only to prevent abuse of the checkout process.</li>
            </ul>
          </Section>

          <Section title="How we use it">
            <p>We use this information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Process your gift and send you a receipt and confirmation.</li>
              <li>Keep a giving history you can view from your account.</li>
              <li>Let the organisation you gave to manage its own records, including Gift Aid claims where applicable.</li>
              <li>Send you sign-in links and account-related emails.</li>
              <li>Detect and prevent fraudulent or abusive use of the checkout process.</li>
            </ul>
            <p>We do not sell your information, and we do not use it for advertising.</p>
          </Section>

          <Section title="Who we share it with">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="font-semibold text-slate-800">Stripe</strong>, to
                process your payment securely. Stripe has its own privacy policy
                governing the payment details you give it directly.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">Supabase</strong>, our
                authentication and database provider, which stores your account and
                giving records on our behalf.
              </li>
              <li>
                <strong className="font-semibold text-slate-800">
                  The organisation you give to
                </strong>
                , which can see gifts made to it, including your name, email, amount,
                and Gift Aid status where applicable — the same information any
                organisation keeps for gifts it receives.
              </li>
            </ul>
            <p>We do not share your information with any other third party.</p>
          </Section>

          <Section title="Cookies">
            <p>
              GetFlow uses a small number of cookies required to keep you signed in
              securely. We do not use advertising or third-party tracking cookies.
            </p>
          </Section>

          <Section title="How long we keep your information">
            <p>
              We keep giving records for as long as your account exists, and as long as
              organisations are legally required to retain financial and Gift Aid
              records. You can ask us to delete your account information at any time,
              subject to records an organisation is legally required to keep.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              You can ask to see, correct, or delete the personal information we hold
              about you at any time. To do so, contact us using the details below, or
              contact the organisation you gave to directly for questions about a
              specific gift.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this policy or your information can be sent to{" "}
              <a className="gf-link" href="mailto:privacy@thetechbuilder.co.uk">
                privacy@thetechbuilder.co.uk
              </a>
              .
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this policy from time to time. Material changes will be
              reflected by updating the date at the top of this page.
            </p>
          </Section>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <Link className="gf-link" href="/">
              Back to GetFlow
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
