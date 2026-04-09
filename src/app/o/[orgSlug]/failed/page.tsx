import Link from "next/link";

type FailedPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function FailedPage({ params }: FailedPageProps) {
  const { orgSlug } = await params;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff4ef_0%,_#f8f6f1_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-red-200/80 bg-white/90 p-6 text-center shadow-[0_24px_70px_rgba(127,29,29,0.1)] backdrop-blur sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-700">
              !
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-red-700">
              Payment not completed
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Your contribution did not go through
            </h1>
            <p className="mt-3 text-sm leading-6 text-black/65 sm:text-base">
              No charge was confirmed. You can head back to the giving page and try
              again when you are ready.
            </p>

            <Link
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 sm:w-auto"
              href={`/o/${orgSlug}/give`}
            >
              Try again
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
