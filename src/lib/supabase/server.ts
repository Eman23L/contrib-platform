import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Session, User } from "@supabase/supabase-js";

import { getRequiredServerEnv, logServerEnvPresence } from "@/lib/env/server";

const AUTH_FLOW_STORAGE_KEY = "contrib-platform-auth";

export const ADMIN_ACCESS_TOKEN_COOKIE = "contrib-admin-access-token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "contrib-admin-refresh-token";
const AUTH_FLOW_CODE_VERIFIER_COOKIE = `${AUTH_FLOW_STORAGE_KEY}-code-verifier`;

type CookieState = { value: string } | undefined;

type CookieOptionsLike = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

type CookieReader = {
  get(name: string): CookieState;
};

type CookieWriter = CookieReader & {
  delete(name: string): void;
  set(name: string, value: string, options?: CookieOptionsLike): void;
};

type AuthenticatedServerUser = {
  accessToken: string;
  user: User;
};

function getSupabaseUrl(context: string) {
  return getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_URL", context);
}

function getSupabaseAnonKey(context: string) {
  return getRequiredServerEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", context);
}

function getCookieOptions(maxAge?: number): CookieOptionsLike {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

function createCookieStorage(cookieStore: CookieWriter) {
  return {
    getItem(key: string) {
      return cookieStore.get(key)?.value ?? null;
    },
    isServer: true,
    removeItem(key: string) {
      cookieStore.delete(key);
    },
    setItem(key: string, value: string) {
      cookieStore.set(key, value, getCookieOptions());
    },
  };
}

export function createServerSupabaseServiceClient(): SupabaseClient {
  const context = "createServerSupabaseServiceClient";

  logServerEnvPresence(context);

  const url = getSupabaseUrl(context);
  const serviceRoleKey = getRequiredServerEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    context,
  );

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseAuthClient(cookieStore: CookieWriter): SupabaseClient {
  const context = "createServerSupabaseAuthClient";

  logServerEnvPresence(context);

  return createClient(getSupabaseUrl(context), getSupabaseAnonKey(context), {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: true,
      storage: createCookieStorage(cookieStore),
      storageKey: AUTH_FLOW_STORAGE_KEY,
    },
  });
}

export function createServerSupabaseAnonClient(): SupabaseClient {
  const context = "createServerSupabaseAnonClient";

  logServerEnvPresence(context);

  return createClient(getSupabaseUrl(context), getSupabaseAnonKey(context), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createServerSupabaseUserClient(accessToken: string): SupabaseClient {
  const context = "createServerSupabaseUserClient";

  logServerEnvPresence(context);

  return createClient(getSupabaseUrl(context), getSupabaseAnonKey(context), {
    accessToken: async () => accessToken,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getAuthenticatedServerUser(): Promise<AuthenticatedServerUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const context = "getAuthenticatedServerUser";
  logServerEnvPresence(context);

  const supabase = createClient(getSupabaseUrl(context), getSupabaseAnonKey(context), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return {
    accessToken,
    user: data.user,
  };
}

export function setAdminSessionCookies(cookieStore: CookieWriter, session: Session) {
  cookieStore.set(
    ADMIN_ACCESS_TOKEN_COOKIE,
    session.access_token,
    getCookieOptions(session.expires_in),
  );
  cookieStore.set(
    ADMIN_REFRESH_TOKEN_COOKIE,
    session.refresh_token,
    getCookieOptions(60 * 60 * 24 * 30),
  );
}

export function clearAdminSessionCookies(cookieStore: CookieWriter) {
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);
  cookieStore.delete(AUTH_FLOW_STORAGE_KEY);
  cookieStore.delete(AUTH_FLOW_CODE_VERIFIER_COOKIE);
}

export function clearAuthFlowCookies(cookieStore: CookieWriter) {
  cookieStore.delete(AUTH_FLOW_STORAGE_KEY);
  cookieStore.delete(AUTH_FLOW_CODE_VERIFIER_COOKIE);
}
