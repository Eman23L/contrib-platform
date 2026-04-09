"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const isEnvironmentError =
    error.message.includes("Missing required environment variable:") ||
    REQUIRED_ENV_VARS.some((name) => error.message.includes(name));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">
        {isEnvironmentError ? "Supabase environment setup required" : "Something went wrong"}
      </h1>
      <p className="max-w-xl text-sm whitespace-pre-line text-black/70">{error.message}</p>
      {isEnvironmentError ? (
        <div className="max-w-xl space-y-3">
          <p className="text-sm text-black/65">
            This route reads Supabase on the server before render. In this app that starts in
            <code className="mx-1 rounded bg-black/5 px-1 py-0.5 text-xs">
              createServerSupabaseServiceClient
            </code>
            and is triggered by
            <code className="mx-1 rounded bg-black/5 px-1 py-0.5 text-xs">
              /o/[orgSlug]/give
            </code>
            while loading the organisation and funds.
          </p>
          <pre className="overflow-x-auto rounded-2xl border border-black/10 bg-white px-4 py-4 text-left text-xs text-black/80">
{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=`}
          </pre>
        </div>
      ) : null}
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
