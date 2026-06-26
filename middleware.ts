import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ACCESS_TOKEN_COOKIE = "contrib-admin-access-token";
const ADMIN_REFRESH_TOKEN_COOKIE = "contrib-admin-refresh-token";
const SUPPORTER_ACCESS_TOKEN_COOKIE = "contrib-supporter-access-token";
const SUPPORTER_REFRESH_TOKEN_COOKIE = "contrib-supporter-refresh-token";

const REFRESH_WINDOW_SECONDS = 5 * 60;

type SessionCookiePair = {
  accessCookie: string;
  refreshCookie: string;
};

const SESSION_COOKIE_PAIRS: SessionCookiePair[] = [
  {
    accessCookie: ADMIN_ACCESS_TOKEN_COOKIE,
    refreshCookie: ADMIN_REFRESH_TOKEN_COOKIE,
  },
  {
    accessCookie: SUPPORTER_ACCESS_TOKEN_COOKIE,
    refreshCookie: SUPPORTER_REFRESH_TOKEN_COOKIE,
  },
];

function getCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

function getTokenExpirySeconds(accessToken?: string) {
  if (!accessToken) {
    return null;
  }

  const [, payload] = accessToken.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as {
      exp?: unknown;
    };

    return typeof decodedPayload.exp === "number" ? decodedPayload.exp : null;
  } catch {
    return null;
  }
}

function shouldRefreshAccessToken(accessToken?: string) {
  const expiresAt = getTokenExpirySeconds(accessToken);

  if (!expiresAt) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);

  return expiresAt - now <= REFRESH_WINDOW_SECONDS;
}

async function refreshSessionCookies(
  request: NextRequest,
  response: NextResponse,
  pair: SessionCookiePair,
) {
  const refreshToken = request.cookies.get(pair.refreshCookie)?.value;

  if (!refreshToken) {
    return;
  }

  const accessToken = request.cookies.get(pair.accessCookie)?.value;

  if (!shouldRefreshAccessToken(accessToken)) {
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return;
  }

  response.cookies.set(
    pair.accessCookie,
    data.session.access_token,
    getCookieOptions(data.session.expires_in),
  );
  response.cookies.set(
    pair.refreshCookie,
    data.session.refresh_token,
    getCookieOptions(60 * 60 * 24 * 30),
  );
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  await Promise.all(
    SESSION_COOKIE_PAIRS.map((pair) =>
      refreshSessionCookies(request, response, pair),
    ),
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|logo/|manifest.webmanifest|offline.html).*)",
  ],
};
