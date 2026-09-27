import Link from "next/link";

type FailedPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default async function FailedPage({ params }: FailedPageProps) {
  const { orgSlug } = await params;

  return (
    <main className="gf-page">
      <div className="gf-shell max-w-2xl">
        <section className="gf-card w-full p-6 text-center sm:p-8">
          <div className="mx-auto flex max-w-lg flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-red-700">
              !
            </div>
            <p className="mt-6 text-sm font-medium text-red-700">
              Checkout not completed
            </p>
            <h1 className="gf-title mt-3">
              Your gift wasn&apos;t finished
            </h1>
            <p className="gf-copy mt-3">
              No payment was taken. Whether you changed your mind or something
              went wrong, you&apos;re welcome to try again whenever you&apos;re ready.
            </p>

            <Link
              className="gf-button-primary mt-8 w-full sm:w-auto"
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
