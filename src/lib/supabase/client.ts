import { createClient } from "@supabase/supabase-js";

function getRequiredBrowserEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      [
        `Missing required environment variable: ${name}.`,
        "Browser-side Supabase only uses the public anon key.",
        "Expected values in the project root .env.local file.",
        "Add the public Supabase values to .env.local and restart the dev server.",
      ].join("\n"),
    );
  }

  return value;
}

export function createBrowserSupabaseClient() {
  const url = getRequiredBrowserEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getRequiredBrowserEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey);
}
