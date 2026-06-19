import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildRequestUrl } from "@/lib/auth/urls";
import { clearAdminSessionCookies } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  clearAdminSessionCookies(cookieStore);

  return NextResponse.redirect(buildRequestUrl(request, "/sign-in"));
}
