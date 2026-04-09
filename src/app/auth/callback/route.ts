import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  clearAdminSessionCookies,
  clearAuthFlowCookies,
  createServerSupabaseAuthClient,
  setAdminSessionCookies,
} from "@/lib/supabase/server";

function getSafeNextPath(next?: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/admin";
  }

  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = getSafeNextPath(url.searchParams.get("next"));
  const cookieStore = await cookies();

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing_code", request.url),
    );
  }

  const supabase = createServerSupabaseAuthClient(cookieStore);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    clearAdminSessionCookies(cookieStore);

    return NextResponse.redirect(
      new URL(`/sign-in?error=auth_callback_failed&next=${encodeURIComponent(nextPath)}`, request.url),
    );
  }

  setAdminSessionCookies(cookieStore, data.session);
  clearAuthFlowCookies(cookieStore);

  return NextResponse.redirect(new URL(nextPath, request.url));
}
