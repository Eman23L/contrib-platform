import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { hasAdminSignInAccess } from "@/lib/auth/adminAccess";
import { buildRequestUrl, getSafeInternalPath } from "@/lib/auth/urls";
import { listAdminMembershipsForUser } from "@/lib/db/queries/memberships";
import { createServerSupabaseAuthClient } from "@/lib/supabase/server";
import {
  createServerSupabaseUserClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";

type StartSignInRequest = {
  createAccount?: boolean;
  email?: string;
  next?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PUBLIC_PATH = "/account";

function getSafeNextPath(next?: string) {
  const safePath = getSafeInternalPath(next);

  return safePath === "/" ? DEFAULT_PUBLIC_PATH : safePath;
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() ?? "";
}

function isAdminPath(path: string) {
  return (
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path.startsWith("/admin?") ||
    path.startsWith("/admin#")
  );
}

function getMagicLinkErrorMessage(message?: string) {
  if (!message) {
    return "We could not send a sign-in link. Please try again.";
  }

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("email send rate")
  ) {
    return "Too many sign-in emails have been requested. Please wait a few minutes, then try again.";
  }

  if (message.toLowerCase().includes("signup")) {
    return "No account exists for this email address. Use an existing account or continue as guest.";
  }

  return "We could not send a sign-in link. Please try again.";
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

    const adminPath = isAdminPath(nextPath);
    const accountNextPath = adminPath ? DEFAULT_PUBLIC_PATH : nextPath;

    try {
      const hasAdminAccess = await hasAdminSignInAccess(email);

      if (hasAdminAccess) {
        return NextResponse.json({
          mode: "password",
          ok: true,
        });
      }

      if (adminPath) {
        return NextResponse.json(
          {
            mode: "create_account_prompt",
            ok: true,
          },
        );
      }
    } catch (error) {
      console.error("[auth/start] Admin sign-in lookup failed", error);

      if (adminPath) {
        return NextResponse.json(
          {
            error:
              "We could not check admin access right now. Please try again in a moment.",
            ok: false,
          },
          { status: 503 },
        );
      }
    }

    const authenticatedUser = await getAuthenticatedServerUser();

    if (
      authenticatedUser?.user.email &&
      normalizeEmail(authenticatedUser.user.email) === email
    ) {
      const userSupabase = createServerSupabaseUserClient(authenticatedUser.accessToken);
      const memberships = await listAdminMembershipsForUser(
        userSupabase,
        authenticatedUser.user.id,
      );

      return NextResponse.json({
        mode: "redirect",
        next: memberships.length > 0 ? nextPath : DEFAULT_PUBLIC_PATH,
        ok: true,
      });
    }

    if (!payload.createAccount) {
      return NextResponse.json({
        mode: "create_account_prompt",
        ok: true,
      });
    }

    const { error } = await sendMagicLink(request, email, accountNextPath);

    if (error) {
      console.error("[auth/start] Magic-link sign-in failed", {
        message: error.message,
        nextPath: accountNextPath,
      });

      return NextResponse.json(
        {
          error: getMagicLinkErrorMessage(error.message),
          ok: false,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      mode: "magic_link_sent",
      ok: true,
    });
  } catch (error) {
    console.error("[auth/start] Unexpected sign-in start failure", error);

    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
        ok: false,
      },
      { status: 500 },
    );
  }
}
