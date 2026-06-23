import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildRequestUrl, getSafeInternalPath } from "@/lib/auth/urls";
import { createServerSupabaseAuthClient } from "@/lib/supabase/server";

type MagicLinkRequest = {
  email?: string;
  next?: string;
};

const DEFAULT_PUBLIC_PATH = "/account";

function getSafeNextPath(next?: string) {
  const safePath = getSafeInternalPath(next);

  return safePath === "/" ? DEFAULT_PUBLIC_PATH : safePath;
}

export async function POST(request: Request) {
  const payload = (await request.json()) as MagicLinkRequest;
  const email = payload.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      {
        error: "Enter the email address to continue.",
        ok: false,
      },
      { status: 400 },
    );
  }

  const nextPath = getSafeNextPath(payload.next);
  const cookieStore = await cookies();
  const supabase = createServerSupabaseAuthClient(cookieStore);
  const redirectTo = buildRequestUrl(request, "/auth/callback");

  redirectTo.searchParams.set("next", nextPath);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo.toString(),
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message === "Signups not allowed for otp"
            ? "This email is not provisioned for admin access."
            : error.message,
        ok: false,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
