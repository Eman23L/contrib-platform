import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { hasAdminSignInAccess } from "@/lib/auth/adminAccess";
import { buildRequestUrl, getSafeInternalPath } from "@/lib/auth/urls";
import { createServerSupabaseAuthClient } from "@/lib/supabase/server";

type StartSignInRequest = {
  email?: string;
  next?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSafeNextPath(next?: string) {
  return getSafeInternalPath(next) === "/" ? "/admin" : getSafeInternalPath(next);
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() ?? "";
}

async function sendMagicLink(request: Request, email: string, nextPath: string) {
  const cookieStore = await cookies();
  const supabase = createServerSupabaseAuthClient(cookieStore);
  const redirectTo = buildRequestUrl(request, "/auth/callback");

  redirectTo.searchParams.set("next", nextPath);

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo.toString(),
      shouldCreateUser: true,
    },
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StartSignInRequest;
    const email = normalizeEmail(payload.email);
    const nextPath = getSafeNextPath(payload.next);

    if (!email || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
          ok: false,
        },
        { status: 400 },
      );
    }

    if (await hasAdminSignInAccess(email)) {
      return NextResponse.json({
        mode: "password",
        ok: true,
      });
    }

    const { error } = await sendMagicLink(request, email, nextPath);

    if (error) {
      return NextResponse.json(
        {
          error: "Something went wrong. Please try again.",
          ok: false,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      mode: "magic_link_sent",
      ok: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        ok: false,
      },
      { status: 500 },
    );
  }
}
