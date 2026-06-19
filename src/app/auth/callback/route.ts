import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildRequestUrl, getSafeInternalPath } from "@/lib/auth/urls";
import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import {
  clearAdminSessionCookies,
  clearAuthFlowCookies,
  createServerSupabaseAuthClient,
  createServerSupabaseUserClient,
  setAdminSessionCookies,
} from "@/lib/supabase/server";

const DEFAULT_PUBLIC_PATH = "/o/grace-community/give";

function getSafeNextPath(next?: string | null) {
  const safePath = getSafeInternalPath(next);

  return safePath === "/" ? DEFAULT_PUBLIC_PATH : safePath;
}

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin?");
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = getSafeNextPath(url.searchParams.get("next"));
  const cookieStore = await cookies();

  if (!code) {
    return NextResponse.redirect(buildRequestUrl(request, "/sign-in?error=missing_code"));
  }

  const supabase = createServerSupabaseAuthClient(cookieStore);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    clearAdminSessionCookies(cookieStore);

    return NextResponse.redirect(
      buildRequestUrl(
        request,
        `/sign-in?error=auth_callback_failed&next=${encodeURIComponent(nextPath)}`,
      ),
    );
  }

  setAdminSessionCookies(cookieStore, data.session);
  clearAuthFlowCookies(cookieStore);

  if (isAdminPath(nextPath)) {
    const userSupabase = createServerSupabaseUserClient(data.session.access_token);
    let memberships: Awaited<ReturnType<typeof listAdminMembershipsForUser>> = [];

    try {
      memberships = await listAdminMembershipsForUser(
        userSupabase,
        data.session.user.id,
      );
    } catch {
      return NextResponse.redirect(
        buildRequestUrl(request, getPublicFallbackPath(nextPath)),
      );
    }

    if (memberships.length === 0) {
      return NextResponse.redirect(
        buildRequestUrl(request, getPublicFallbackPath(nextPath)),
      );
    }
  }

  return NextResponse.redirect(buildRequestUrl(request, nextPath));
}
