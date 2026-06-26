"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  console.error("[app/error] Unhandled render error", error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-xl text-sm text-black/70">
        We could not load this page. Please try again in a moment.
      </p>
      <button
        className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
