import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupporterGivingHistory } from "@/lib/services/account/getSupporterGivingHistory";
import {
  createServerSupabaseServiceClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";

const DEFAULT_GIVING_PATH = "/o/grace-community/give";

function formatAmount(amountMinor: number, currencyCode: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  }).format(amountMinor / 100);
}

function getStatusLabel(status: string) {
  switch (status) {
    case "succeeded":
      return "Completed";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Pending";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "succeeded":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "cancelled":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default async function AccountPage() {
  const authenticatedUser = await getAuthenticatedServerUser();

  if (!authenticatedUser) {
    redirect("/sign-in");
  }

  const supabase = createServerSupabaseServiceClient();
  const history = await getSupporterGivingHistory(supabase, {
    email: authenticatedUser.user.email?.trim().toLowerCase() ?? null,
    userId: authenticatedUser.user.id,
  });

  const giveAgainHref = history[0]
    ? `/o/${history[0].organisationSlug || "grace-community"}/give`
    : DEFAULT_GIVING_PATH;

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-5xl">
        <div className="w-full space-y-6">
          <section className="gf-card w-full p-6 sm:p-8">
            <p className="gf-kicker">GetFlow account</p>
            <h1 className="gf-title mt-3">Welcome back</h1>
            <p className="gf-copy mt-3 max-w-3xl">
              Your giving, receipts, and recent gifts in one place.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <span className="inline-flex w-full items-center rounded-[1.25rem] border border-slate-200/80 bg-accentSoft px-4 py-3 text-sm font-medium text-slate-700 sm:w-auto">
                Signed in as {authenticatedUser.user.email ?? "your account"}
              </span>
              <Link className="gf-button-primary" href={giveAgainHref}>
                Give again
              </Link>
              <Link className="gf-button-secondary" href={DEFAULT_GIVING_PATH}>
                View giving page
              </Link>
              <form action="/auth/sign-out" method="post">
                <button className="gf-button-secondary w-full sm:w-auto" type="submit">
                  Sign out
                </button>
              </form>
            </div>
          </section>

          <section className="gf-card w-full p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="gf-kicker">Giving history</p>
                <h2 className="gf-section-title mt-2">Recent gifts</h2>
                <p className="gf-copy mt-2">
                  A simple record of gifts linked to this account.
                </p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-slate-950">
                  You have not made any gifts yet.
                </h3>
                <p className="gf-copy mt-3 max-w-2xl">
                  Start by choosing an organisation to support.
                </p>
                <div className="mt-6">
                  <Link className="gf-button-primary" href={DEFAULT_GIVING_PATH}>
                    Give now
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {history.map((item) => (
                  <article
                    className="gf-card-soft p-4 sm:p-5"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <Link
                          className="text-base font-semibold text-slate-950 transition hover:text-[#3f6948]"
                          href={`/o/${item.organisationSlug || "grace-community"}/give`}
                        >
                          {item.organisationName}
                        </Link>
                        <p className="text-sm text-slate-600">{item.fundName}</p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-semibold tracking-tight text-slate-950">
                          {formatAmount(item.amountMinor, item.currencyCode)}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                            item.paymentStatus,
                          )}`}
                        >
                          {getStatusLabel(item.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-slate-500">Date</dt>
                        <dd className="mt-1 font-medium text-slate-950">
                          {item.dateLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Payment status</dt>
                        <dd className="mt-1 font-medium text-slate-950">
                          {getStatusLabel(item.paymentStatus)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Reference</dt>
                        <dd className="mt-1 break-all font-mono text-xs text-slate-700">
                          {item.paymentReference ?? "Not available yet"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
