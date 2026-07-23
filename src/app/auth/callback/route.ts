import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType, Session } from "@supabase/supabase-js";

import { buildRequestUrl, getSafeInternalPath } from "@/lib/auth/urls";
import {
  clearAuthFlowCookies,
  createServerSupabaseAuthClient,
  createServerSupabaseUserClient,
  setSupporterSessionCookies,
} from "@/lib/supabase/server";

const DEFAULT_PUBLIC_PATH = "/account";
const PENDING_FIRST_NAME_COOKIE = "contrib-pending-first-name";
const PENDING_LAST_NAME_COOKIE = "contrib-pending-last-name";
const EMAIL_OTP_TYPES = new Set([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

function getSafeNextPath(next?: string | null) {
  const safePath = getSafeInternalPath(next);

  return safePath === "/" ? DEFAULT_PUBLIC_PATH : safePath;
}

function isAdminPath(path: string) {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/admin?") ||
    path.startsWith("/admin#")
  );
}

function getPublicFallbackPath(path: string) {
  if (path.startsWith("/o/")) {
    return path;
  }

  if (isAdminPath(path)) {
    const adminUrl = new URL(path, "https://getflow.local");
    const orgSlug = adminUrl.searchParams.get("org");

    if (orgSlug && /^[a-z0-9-]+$/i.test(orgSlug)) {
      return `/o/${orgSlug}/give`;
    }
  }

  return DEFAULT_PUBLIC_PATH;
}

function getEmailOtpType(type?: string | null): EmailOtpType {
  if (type && EMAIL_OTP_TYPES.has(type)) {
    return type as EmailOtpType;
  }

  return "magiclink";
}

async function exchangeCallbackForSession(
  supabase: ReturnType<typeof createServerSupabaseAuthClient>,
  url: URL,
): Promise<{ error: unknown; session: Session | null }> {
  const code = url.searchParams.get("code");

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    return {
      error,
      session: data.session ?? null,
    };
  }

  const tokenHash = url.searchParams.get("token_hash");

  if (tokenHash) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: getEmailOtpType(url.searchParams.get("type")),
    });

    return {
      error,
      session: data.session ?? null,
    };
  }

  return {
    error: new Error("Missing auth callback credentials."),
    session: null,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextPath = getSafeNextPath(url.searchParams.get("next"));
  const cookieStore = await cookies();
  const callbackError = url.searchParams.get("error");

  if (callbackError) {
    clearAuthFlowCookies(cookieStore);

    return NextResponse.redirect(
      buildRequestUrl(
        request,
        `/sign-in?error=auth_callback_failed&next=${encodeURIComponent(nextPath)}`,
      ),
    );
  }

  const supabase = createServerSupabaseAuthClient(cookieStore);
  const { error, session } = await exchangeCallbackForSession(supabase, url);

  if (error || !session) {
    clearAuthFlowCookies(cookieStore);

    return NextResponse.redirect(
      buildRequestUrl(
        request,
        `/sign-in?error=auth_callback_failed&next=${encodeURIComponent(nextPath)}`,
      ),
    );
  }

  setSupporterSessionCookies(cookieStore, session);

  const firstName = decodeURIComponent(
    cookieStore.get(PENDING_FIRST_NAME_COOKIE)?.value ?? "",
  ).trim();
  const lastName = decodeURIComponent(
    cookieStore.get(PENDING_LAST_NAME_COOKIE)?.value ?? "",
  ).trim();

  if (firstName || lastName) {
    try {
      const profileSupabase = createServerSupabaseUserClient(session.access_token);
      await profileSupabase.auth.updateUser({
        data: {
          first_name: firstName || undefined,
          last_name: lastName || undefined,
        },
      });
    } catch {
      // A successful login must not be blocked by a non-essential profile update.
    }
  }

  cookieStore.delete(PENDING_FIRST_NAME_COOKIE);
  cookieStore.delete(PENDING_LAST_NAME_COOKIE);
  clearAuthFlowCookies(cookieStore);

  if (isAdminPath(nextPath)) {
    return NextResponse.redirect(
      buildRequestUrl(request, getPublicFallbackPath(nextPath)),
    );
  }

  return NextResponse.redirect(buildRequestUrl(request, nextPath));
}
