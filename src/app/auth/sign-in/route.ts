import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSafeInternalPath } from "@/lib/auth/urls";
import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import {
  clearAdminSessionCookies,
  createServerSupabaseAnonClient,
  createServerSupabaseUserClient,
  setAdminSessionCookies,
} from "@/lib/supabase/server";

type AdminPasswordSignInRequest = {
  email?: string;
  next?: string;
  password?: string;
};

function getSafeNextPath(next?: string) {
  const safePath = getSafeInternalPath(next);

  if (
    safePath === "/admin" ||
    safePath.startsWith("/admin/") ||
    safePath.startsWith("/admin?") ||
    safePath.startsWith("/admin#")
  ) {
    return safePath;
  }

  return "/admin";
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AdminPasswordSignInRequest;
  const email = payload.email?.trim().toLowerCase();
  const password = payload.password ?? "";
  const nextPath = getSafeNextPath(payload.next);
  const cookieStore = await cookies();

  if (!email || !password) {
    return NextResponse.json(
      {
        error: "Enter both email and password to continue.",
        ok: false,
      },
      { status: 400 },
    );
  }

  const supabase = createServerSupabaseAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    clearAdminSessionCookies(cookieStore);

    return NextResponse.json(
      {
        error: "Invalid email or password.",
        ok: false,
      },
      { status: 401 },
    );
  }

  const userSupabase = createServerSupabaseUserClient(data.session.access_token);
  const memberships = await listAdminMembershipsForUser(userSupabase, data.user.id);

  if (memberships.length === 0) {
    clearAdminSessionCookies(cookieStore);

    return NextResponse.json(
      {
        error:
          "Your account signed in successfully, but it does not have an active admin role.",
        ok: false,
      },
      { status: 403 },
    );
  }

  setAdminSessionCookies(cookieStore, data.session);

  return NextResponse.json({
    next: nextPath,
    ok: true,
  });
}
