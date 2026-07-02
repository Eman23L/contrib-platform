import { NextResponse, type NextRequest } from "next/server";

import { requireAdminRole } from "@/lib/auth/requireAdminRole";
import { createServerSupabaseUserClient } from "@/lib/supabase/server";
import { getAdminContributions } from "@/lib/services/admin/getAdminContributions";
import type { ContributionIntent } from "@/types/domain";

function getValidatedStatus(value?: string | null): ContributionIntent["status"] | undefined {
  if (
    value === "draft" ||
    value === "checkout_created" ||
    value === "pending_payment" ||
    value === "succeeded" ||
    value === "failed" ||
    value === "cancelled" ||
    value === "expired"
  ) {
    return value;
  }

  return undefined;
}

function getValidatedDate(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function escapeCsvValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes("\"") ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
}

function toCsv(rows: string[][]) {
  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

function formatAmount(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

export async function GET(request: NextRequest) {
  const orgSlug = request.nextUrl.searchParams.get("org")?.trim() ?? "";
  const access = await requireAdminRole(orgSlug, `/admin/reports/contributions?org=${orgSlug}`);

  if (access.kind === "unauthenticated") {
    return NextResponse.redirect(new URL(access.signInPath, request.url));
  }

  if (access.kind !== "authenticated") {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createServerSupabaseUserClient(access.value.accessToken);
  const data = await getAdminContributions(
    supabase,
    access.value.membership.organisationSlug,
    {
      endDate: getValidatedDate(request.nextUrl.searchParams.get("end")),
      fundId: request.nextUrl.searchParams.get("fund") || undefined,
      startDate: getValidatedDate(request.nextUrl.searchParams.get("start")),
      status: getValidatedStatus(request.nextUrl.searchParams.get("status")),
    },
  );

  if (!data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const csv = toCsv([
    [
      "Contribution ID",
      "Created at",
      "Organisation",
      "Supporter name",
      "Supporter email",
      "Fund",
      "Amount",
      "Currency",
      "Status",
      "Paid at",
      "Stripe checkout session",
    ],
    ...data.contributions.map((contribution) => [
      contribution.id,
      contribution.createdAt,
      contribution.organisationName,
      contribution.donorName ?? "",
      contribution.guestEmail ?? "",
      contribution.fundName ?? "",
      formatAmount(contribution.amountMinor),
      contribution.currencyCode,
      contribution.status,
      contribution.paidAt ?? "",
      contribution.stripeCheckoutSessionId ?? "",
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="getflow-${data.organisationSlug}-contributions.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
