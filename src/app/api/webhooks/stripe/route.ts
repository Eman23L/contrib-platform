import { NextResponse } from "next/server";

import { processStripeWebhook } from "@/lib/services/processStripeWebhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const result = await processStripeWebhook(payload, signature);

  return NextResponse.json(result.body, { status: result.status });
}
