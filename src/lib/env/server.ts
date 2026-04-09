import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

export const SUPABASE_SERVER_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const STRIPE_SERVER_ENV_NAMES = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

const SERVER_ENV_NAMES = [
  ...SUPABASE_SERVER_ENV_NAMES,
  ...STRIPE_SERVER_ENV_NAMES,
] as const;

type ServerEnvName = (typeof SERVER_ENV_NAMES)[number];

declare global {
  // eslint-disable-next-line no-var
  var __contribPlatformServerEnvLogged__: boolean | undefined;
}

function getEnvFilePath() {
  return path.join(process.cwd(), ".env.local");
}

export function logServerEnvPresence(context: string) {
  if (globalThis.__contribPlatformServerEnvLogged__) {
    return;
  }

  const envStatus = Object.fromEntries(
    SERVER_ENV_NAMES.map((name) => [
      name,
      process.env[name] ? "present" : "missing",
    ]),
  );

  console.info("[env] Supabase runtime env check", {
    context,
    envFilePath: getEnvFilePath(),
    envFilePresent: existsSync(getEnvFilePath()),
    ...envStatus,
  });

  globalThis.__contribPlatformServerEnvLogged__ = true;
}

export function getRequiredServerEnv(
  name: ServerEnvName,
  context: string,
) {
  const value = process.env[name];

  if (!value) {
    const envFilePath = getEnvFilePath();
    const envFilePresent = existsSync(envFilePath);

    throw new Error(
      [
        `Missing required environment variable: ${name}.`,
        `Supabase setup failed while running: ${context}.`,
        `Expected Next.js to load local env values from: ${envFilePath}`,
        `Detected .env.local in project root: ${envFilePresent ? "yes" : "no"}`,
        "Required values for this project:",
        "NEXT_PUBLIC_SUPABASE_URL=...",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=...",
        "SUPABASE_SERVICE_ROLE_KEY=...",
        "STRIPE_SECRET_KEY=...",
        "STRIPE_WEBHOOK_SECRET=...",
        "After updating .env.local, fully stop and restart `pnpm dev`.",
      ].join("\n"),
    );
  }

  return value;
}

export function getOptionalServerEnv(name: ServerEnvName) {
  return process.env[name];
}
