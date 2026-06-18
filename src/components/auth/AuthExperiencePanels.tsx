import Link from "next/link";
import type { ReactNode } from "react";

type AuthBrandPanelProps = {
  compact?: boolean;
};

type AuthCardProps = {
  children: ReactNode;
  footer?: ReactNode;
  helperText?: string;
  signedInBanner?: ReactNode;
};

const insightItems = [
  { label: "Giving", value: "Clear and secure" },
  { label: "Community", value: "Simple to manage" },
  { label: "Clarity", value: "Ready when needed" },
];

export function AuthBrandPanel({ compact = false }: AuthBrandPanelProps) {
  return (
    <div className="gf-card relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e9dc] bg-white/80 px-3 py-1.5 text-sm font-medium text-[#5f7f66] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-accent" />
          GetFlow
        </div>

        <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Simple giving for modern communities
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
          Help people give securely, understand what is happening, and manage
          community activity with calm, clear tools.
        </p>

        {!compact ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {insightItems.map((item) => (
              <div
                className="gf-card-soft px-4 py-4"
                key={item.label}
              >
                <p className="text-sm font-medium text-[#5f7f66]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="gf-card-soft mt-8 p-4">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="gf-kicker">
                Community overview
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                Grace Community
              </p>
            </div>
            <div className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-[#5f7f66]">
              Active
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-accent p-4 text-white shadow-lg shadow-accent/20">
              <p className="text-sm text-white/80">This month</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">GBP 18.4k</p>
              <p className="mt-2 text-sm text-white/85">248 gifts</p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">Community fund</span>
                <span className="text-sm font-semibold text-slate-950">62%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[62%] rounded-full bg-accent" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">New supporters</span>
                <span className="text-sm font-semibold text-slate-950">34</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[46%] rounded-full bg-sky-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthCard({
  children,
  footer,
  helperText = "Sign in to manage giving with clarity",
  signedInBanner,
}: AuthCardProps) {
  return (
    <section className="gf-card w-full p-6 sm:p-8">
      <div className="mx-auto max-w-md">
        <p className="gf-kicker">
          Welcome back
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Sign in to GetFlow
        </h2>
        <p className="gf-copy mt-3">
          {helperText}.
        </p>

        {signedInBanner}

        <div className="mt-7">{children}</div>

        {footer ? <div className="mt-6 text-center">{footer}</div> : null}
      </div>
    </section>
  );
}

export function GuestLink({ href }: { href: string }) {
  return (
    <Link
      className="gf-link"
      href={href}
    >
      Continue as guest
    </Link>
  );
}
