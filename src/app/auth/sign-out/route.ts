import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { clearAdminSessionCookies } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  clearAdminSessionCookies(cookieStore);

  return NextResponse.redirect(new URL("/sign-in", request.url));
}
