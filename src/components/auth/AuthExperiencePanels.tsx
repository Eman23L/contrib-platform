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
  { label: "Contributions", value: "Clear tracking" },
  { label: "Members", value: "Activity at a glance" },
  { label: "Reports", value: "Ready when you need them" },
];

export function AuthBrandPanel({ compact = false }: AuthBrandPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_24px_70px_rgba(30,64,175,0.10)] backdrop-blur-xl sm:p-8 lg:p-10">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-200/55 blur-3xl" />
      <div className="absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-blue-100/80 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-sm font-medium text-blue-900 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          GetFlow
        </div>

        <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Modern giving and community management
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          Simple, secure, and built for modern communities. Manage contributions,
          organise member activity, and understand what is happening across your
          organisation from one calm workspace.
        </p>

        {!compact ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {insightItems.map((item) => (
              <div
                className="rounded-2xl border border-white/80 bg-white/70 px-4 py-4 shadow-sm backdrop-blur"
                key={item.label}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
                Workspace overview
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-950">
                Grace Community
              </p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Live
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 p-4 text-white shadow-lg shadow-blue-500/20">
              <p className="text-sm text-white/75">This month</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">GBP 18.4k</p>
              <p className="mt-2 text-sm text-white/80">248 contributions</p>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">Community fund</span>
                <span className="text-sm font-semibold text-slate-950">62%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[62%] rounded-full bg-blue-500" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-700">New members</span>
                <span className="text-sm font-semibold text-slate-950">34</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[46%] rounded-full bg-cyan-400" />
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
  helperText = "Access your workspace securely",
  signedInBanner,
}: AuthCardProps) {
  return (
    <section className="w-full rounded-[1.75rem] border border-white/75 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-8">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
          Secure sign-in
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          {helperText}. Use the email and password connected to your GetFlow
          workspace.
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
      className="text-sm font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
      href={href}
    >
      Continue to the giving page
    </Link>
  );
}
