import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="gf-page">
      <div className="gf-shell max-w-lg">
        <section className="gf-card w-full p-6 text-center sm:p-8">
          <p className="gf-kicker">Page not found</p>
          <h1 className="gf-title mt-3">We couldn&apos;t find that page</h1>
          <p className="gf-copy mt-3">
            The link may be out of date, or the page may have moved.
          </p>
          <Link className="gf-button-primary mt-6 inline-flex" href="/">
            Go to homepage
          </Link>
        </section>
      </div>
    </main>
  );
}
