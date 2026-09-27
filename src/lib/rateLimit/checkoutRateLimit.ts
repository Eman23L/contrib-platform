import { createServerSupabaseServiceClient } from "@/lib/supabase/server";

const WINDOW_MS = 10 * 60 * 1000;

// A single physical location (e.g. a church scanning a QR code during a
// live offering) can generate many legitimate submissions from one shared
// IP address at once, so the IP-level ceiling stays generous. The
// IP+email ceiling is tight, since a script retrying the same donor
// email over and over is the card-testing pattern this mainly guards
// against.
const IP_LIMIT = 30;
const IP_EMAIL_LIMIT = 5;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    const [first] = forwardedFor.split(",");

    if (first?.trim()) {
      return first.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");

  return realIp?.trim() || "unknown";
}

async function checkAndRecordAttempt(
  clientKey: string,
  limit: number,
): Promise<{ allowed: boolean }> {
  const supabase = createServerSupabaseServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { data, error } = await supabase
    .from("checkout_rate_limit_events")
    .select("id")
    .eq("client_key", clientKey)
    .gte("created_at", windowStart);

  if (error) {
    throw new Error(`Failed to check checkout rate limit: ${error.message}`);
  }

  if ((data?.length ?? 0) >= limit) {
    return { allowed: false };
  }

  const { error: insertError } = await supabase
    .from("checkout_rate_limit_events")
    .insert({ client_key: clientKey });

  if (insertError) {
    throw new Error(`Failed to record checkout rate limit event: ${insertError.message}`);
  }

  return { allowed: true };
}

export async function checkCheckoutRateLimit(input: {
  ip: string;
  guestEmail?: string | null;
}): Promise<{ allowed: boolean }> {
  const ipResult = await checkAndRecordAttempt(`ip:${input.ip}`, IP_LIMIT);

  if (!ipResult.allowed) {
    return ipResult;
  }

  const normalizedEmail = input.guestEmail?.trim().toLowerCase();

  if (!normalizedEmail) {
    return { allowed: true };
  }

  return checkAndRecordAttempt(`ip-email:${input.ip}:${normalizedEmail}`, IP_EMAIL_LIMIT);
}
