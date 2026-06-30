import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildRequestUrl } from "@/lib/auth/urls";
import { clearAllSessionCookies } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  clearAllSessionCookies(cookieStore);

  return NextResponse.redirect(buildRequestUrl(request, "/sign-in"));
}
