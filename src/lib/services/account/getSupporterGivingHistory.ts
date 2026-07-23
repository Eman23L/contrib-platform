import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContributionIntent } from "@/types/domain";

type PaymentStatus = "pending" | "succeeded" | "failed" | "cancelled";

type SupporterContributionRow = {
  id: string;
  created_at: string;
  amount_minor: number;
  currency_code: string;
  status: ContributionIntent["status"];
  guest_email: string | null;
  paid_at: string | null;
  stripe_checkout_session_id: string | null;
  organisations: {
    name: string;
    slug: string;
  } | null;
  funds: {
    name: string;
  } | null;
};

type SupporterPaymentRow = {
  contribution_intent_id: string;
  paid_at: string | null;
  status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

export type SupporterGivingHistoryItem = {
  amountMinor: number;
  checkoutSessionId: string | null;
  contributionStatus: ContributionIntent["status"];
  createdAt: string;
  currencyCode: string;
  dateLabel: string;
  organisationName: string;
  organisationSlug: string;
  paymentReference: string | null;
  paymentStatus: PaymentStatus;
  fundName: string;
  id: string;
};

function mapPaymentStatus(status: ContributionIntent["status"]): PaymentStatus {
  switch (status) {
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "cancelled":
    case "expired":
      return "cancelled";
    default:
      return "pending";
  }
}

function getDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export async function getSupporterGivingHistory(
  supabase: SupabaseClient,
  input: {
    email: string | null;
    userId: string;
  },
): Promise<SupporterGivingHistoryItem[]> {
  const baseSelect = `
        id,
        created_at,
        amount_minor,
        currency_code,
        status,
        guest_email,
        paid_at,
        stripe_checkout_session_id,
        organisations:organisations!inner (
          name,
          slug
        ),
        funds:funds (
          name
        )
      `;

  const userQuery = supabase
    .from("contribution_intents")
    .select(baseSelect)
    .eq("user_id", input.userId)
    .order("created_at", { ascending: false })
    .returns<SupporterContributionRow[]>();

  const emailQuery = input.email
    ? supabase
        .from("contribution_intents")
        .select(baseSelect)
        .eq("guest_email", input.email)
        .order("created_at", { ascending: false })
        .returns<SupporterContributionRow[]>()
    : Promise.resolve({
        data: [] as SupporterContributionRow[],
        error: null as null | { message: string },
      });

  const [{ data: userRows, error: userError }, { data: emailRows, error: emailError }] =
    await Promise.all([userQuery, emailQuery]);

  if (userError) {
    throw new Error(`Failed to load supporter giving history: ${userError.message}`);
  }

  if (emailError) {
    throw new Error(`Failed to load supporter giving history: ${emailError.message}`);
  }

  const mergedRows = new Map<string, SupporterContributionRow>();

  for (const row of userRows) {
    mergedRows.set(row.id, row);
  }

  for (const row of emailRows) {
    mergedRows.set(row.id, row);
  }

  const data = [...mergedRows.values()]
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  if (!data.length) {
    return [];
  }

  const contributionIds = data.map((item) => item.id);
  const { data: paymentRows, error: paymentError } = await supabase
    .from("payments")
    .select(
      `
        contribution_intent_id,
        paid_at,
        status,
        stripe_checkout_session_id,
        stripe_payment_intent_id
      `,
    )
    .in("contribution_intent_id", contributionIds)
    .returns<SupporterPaymentRow[]>();

  if (paymentError) {
    throw new Error(`Failed to load supporter payment history: ${paymentError.message}`);
  }

  const paymentByContributionId = new Map(
    paymentRows.map((row) => [row.contribution_intent_id, row]),
  );

  return data.map((row) => {
    const payment = paymentByContributionId.get(row.id);

    return {
      amountMinor: row.amount_minor,
      checkoutSessionId:
        payment?.stripe_checkout_session_id ?? row.stripe_checkout_session_id ?? null,
      contributionStatus: row.status,
      createdAt: row.created_at,
      currencyCode: row.currency_code,
      dateLabel: getDateLabel(payment?.paid_at ?? row.paid_at ?? row.created_at),
      fundName: row.funds?.name ?? "General giving",
      id: row.id,
      organisationName: row.organisations?.name ?? "Unknown organisation",
      organisationSlug: row.organisations?.slug ?? "",
      paymentReference:
        payment?.stripe_payment_intent_id ??
        payment?.stripe_checkout_session_id ??
        row.stripe_checkout_session_id ??
        null,
      paymentStatus: payment?.status ?? mapPaymentStatus(row.status),
    };
  });
}
