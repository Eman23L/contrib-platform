import { NextResponse } from "next/server";

import { startContributionCheckout } from "@/lib/services/public/startContributionCheckout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await startContributionCheckout(
      payload,
      new URL(request.url).origin,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create contribution intent.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 },
    );
  }
}
