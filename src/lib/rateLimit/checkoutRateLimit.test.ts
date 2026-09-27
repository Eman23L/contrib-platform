import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeSupabase } from "@/lib/services/testUtils/fakeSupabase";

let fakeSupabase: FakeSupabase;

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseServiceClient: () => fakeSupabase,
}));

const { checkCheckoutRateLimit, getClientIp } = await import(
  "@/lib/rateLimit/checkoutRateLimit"
);

beforeEach(() => {
  fakeSupabase = new FakeSupabase();
});

describe("getClientIp", () => {
  it("reads the first address from x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" },
    });

    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then unknown", () => {
    const withRealIp = new Request("https://example.com", {
      headers: { "x-real-ip": "203.0.113.9" },
    });
    expect(getClientIp(withRealIp)).toBe("203.0.113.9");

    const withNeither = new Request("https://example.com");
    expect(getClientIp(withNeither)).toBe("unknown");
  });
});

describe("checkCheckoutRateLimit", () => {
  it("allows requests under the IP limit", async () => {
    const result = await checkCheckoutRateLimit({ ip: "1.2.3.4" });
    expect(result.allowed).toBe(true);
  });

  it("blocks a single IP+email pair after the tight per-pair limit", async () => {
    let lastResult = { allowed: true };

    for (let i = 0; i < 6; i += 1) {
      lastResult = await checkCheckoutRateLimit({
        ip: "1.2.3.4",
        guestEmail: "Card-Tester@Example.com",
      });
    }

    expect(lastResult.allowed).toBe(false);
  });

  it("does not block different emails from the same shared IP within the generous IP ceiling", async () => {
    for (let i = 0; i < 10; i += 1) {
      const result = await checkCheckoutRateLimit({
        ip: "1.2.3.4",
        guestEmail: `giver-${i}@example.com`,
      });
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks once the broad IP ceiling is exceeded even across different emails", async () => {
    let lastResult = { allowed: true };

    for (let i = 0; i < 31; i += 1) {
      lastResult = await checkCheckoutRateLimit({
        ip: "5.6.7.8",
        guestEmail: `giver-${i}@example.com`,
      });
    }

    expect(lastResult.allowed).toBe(false);
  });

  it("keeps IP+email limits independent per email address", async () => {
    for (let i = 0; i < 5; i += 1) {
      await checkCheckoutRateLimit({ ip: "9.9.9.9", guestEmail: "a@example.com" });
    }

    const result = await checkCheckoutRateLimit({ ip: "9.9.9.9", guestEmail: "b@example.com" });
    expect(result.allowed).toBe(true);
  });
});
