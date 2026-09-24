import { NextResponse, type NextRequest } from "next/server";

import { getStripeServerClient } from "@/lib/stripe/server";
import {
  createServerSupabaseServiceClient,
  getAuthenticatedServerUser,
} from "@/lib/supabase/server";

export const runtime = "nodejs";

type RecurringPlanOwnerRow = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: string;
};

function redirectToRecurring(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/account", request.url);
  url.searchParams.set("section", "recurring");

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authenticatedUser = await getAuthenticatedServerUser();

  if (!authenticatedUser) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const supabase = createServerSupabaseServiceClient();
  const { data: plan, error } = await supabase
    .from("recurring_plans")
    .select("id, user_id, stripe_subscription_id, status")
    .eq("id", id)
    .maybeSingle<RecurringPlanOwnerRow>();

  if (error) {
    console.error("[api/account/recurring-plans/cancel] Failed to load plan", {
      message: error.message,
    });
    return redirectToRecurring(request, {
      recurringError: "We could not cancel this recurring gift. Please try again.",
    });
  }

  if (!plan || plan.user_id !== authenticatedUser.user.id) {
    return redirectToRecurring(request, {
      recurringError: "Recurring gift not found.",
    });
  }

  if (plan.status === "canceled") {
    return redirectToRecurring(request, { recurringCanceled: "1" });
  }

  try {
    const stripe = getStripeServerClient();
    await stripe.subscriptions.cancel(plan.stripe_subscription_id);
  } catch (cancelError) {
    console.error("[api/account/recurring-plans/cancel] Stripe cancel failed", {
      message: cancelError instanceof Error ? cancelError.message : "unknown error",
    });
    return redirectToRecurring(request, {
      recurringError: "We could not cancel this recurring gift. Please try again.",
    });
  }

  return redirectToRecurring(request, { recurringCanceled: "1" });
}
