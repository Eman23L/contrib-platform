"use client";

import { useMemo, useState } from "react";

import { AmountPicker } from "@/components/giving/AmountPicker";
import { CheckoutRedirectButton } from "@/components/giving/CheckoutRedirectButton";
import { FundGrid } from "@/components/giving/FundGrid";
import type {
  CreateContributionIntentResponse,
  PublicGivingPageData,
} from "@/types/api";

type GuestGivingFormProps = {
  organisation: PublicGivingPageData;
};

const QUICK_AMOUNTS = [10, 20, 50, 100];

function getCheckoutErrorMessage(error?: string) {
  if (!error) {
    return "We could not start secure checkout. Please try again in a moment.";
  }

  if (
    error.includes("Missing required environment variable") ||
    error.includes("STRIPE_") ||
    error.includes("SUPABASE_") ||
    error.includes("NEXT_PUBLIC_")
  ) {
    return "Secure checkout is not available right now. Please try again later.";
  }

  return error;
}

export function GuestGivingForm({ organisation }: GuestGivingFormProps) {
  const defaultFundId =
    organisation.funds.find((fund) => fund.isDefault)?.id ??
    organisation.funds[0]?.id ??
    null;

  const [selectedFundId, setSelectedFundId] = useState<string | null>(
    defaultFundId,
  );
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    QUICK_AMOUNTS[1] ?? null,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [fundSearch, setFundSearch] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);

  const amount = useMemo(() => {
    if (customAmount.trim()) {
      return Number(customAmount);
    }

    return selectedAmount ?? 0;
  }, [customAmount, selectedAmount]);

  const selectedFund = useMemo(
    () => organisation.funds.find((fund) => fund.id === selectedFundId) ?? null,
    [organisation.funds, selectedFundId],
  );

  const filteredFunds = useMemo(() => {
    const normalizedSearch = fundSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return organisation.funds;
    }

    return organisation.funds.filter((fund) => {
      const searchableText = [fund.name, fund.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [fundSearch, organisation.funds]);

  const formattedAmount = useMemo(() => {
    if (amount <= 0 || Number.isNaN(amount)) {
      return null;
    }

    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: organisation.currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  }, [amount, organisation.currencyCode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIntentId(null);

    if (!selectedFundId) {
      setErrorMessage("Choose a fund to continue.");
      return;
    }

    if (!guestEmail.trim()) {
      setErrorMessage("Enter your email address to receive receipts and view this gift later.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/contribution-intents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organisationSlug: organisation.organisationSlug,
          fundId: selectedFundId,
          amount,
          guestFirstName,
          guestLastName,
          guestEmail,
        }),
      });

      const data =
        (await response.json()) as CreateContributionIntentResponse;

      if (!response.ok || !data.ok) {
        setErrorMessage(
          data.ok
            ? "We could not start secure checkout. Please try again in a moment."
            : getCheckoutErrorMessage(data.error),
        );
        return;
      }

      setIntentId(data.intentId);
      setSuccessMessage("Taking you to secure checkout...");
      window.location.assign(data.checkoutUrl);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Step 1</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Choose where your gift should go
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pick the fund that best matches what you would like to support.
          </p>
        </div>
        <label className="mb-4 block">
          <span className="gf-label">
            Search funds
          </span>
          <input
            className="gf-input"
            onChange={(event) => setFundSearch(event.target.value)}
            placeholder="Search by fund name or description"
            type="search"
            value={fundSearch}
          />
        </label>
        {filteredFunds.length > 0 ? (
          <FundGrid
            funds={filteredFunds}
            onSelectFund={setSelectedFundId}
            selectedFundId={selectedFundId}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-600">
            No funds match your search. Clear the search to see all giving options.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Step 2</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Select an amount
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose a quick amount or enter another amount that feels right.
          </p>
        </div>
        <AmountPicker
          currencyCode={organisation.currencyCode}
          customAmount={customAmount}
          onCustomAmountChange={(value) => {
            setCustomAmount(value);
            setSelectedAmount(null);
          }}
          onSelectAmount={(nextAmount) => {
            setSelectedAmount(nextAmount);
            setCustomAmount("");
          }}
          quickAmounts={QUICK_AMOUNTS}
          selectedAmount={selectedAmount}
        />
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">Step 3</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
            Send me a receipt
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add your email address so we can send receipts and link this gift to your giving history.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="gf-label">
              First name
            </span>
            <input
              autoComplete="given-name"
              className="gf-input"
              onChange={(event) => setGuestFirstName(event.target.value)}
              placeholder="Jane"
              type="text"
              value={guestFirstName}
            />
          </label>
          <label className="block">
            <span className="gf-label">
              Last name
            </span>
            <input
              autoComplete="family-name"
              className="gf-input"
              onChange={(event) => setGuestLastName(event.target.value)}
              placeholder="Smith"
              type="text"
              value={guestLastName}
            />
          </label>
        </div>
        <label className="block">
          <span className="gf-label">
            Email address
          </span>
          <input
            autoComplete="email"
            className="gf-input"
            onChange={(event) => setGuestEmail(event.target.value)}
            placeholder="name@example.com"
            required
            type="email"
            value={guestEmail}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Your gift
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {selectedFund
                ? `Supporting ${selectedFund.name}`
                : "Choose a fund to continue"}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Amount</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {formattedAmount ?? "Not set"}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-2xl bg-white/78 px-4 py-3 text-sm leading-6 text-slate-600">
          Your {organisation.publicSettings.givingActionLabel.toLowerCase()} is processed securely. You will review the payment before it is completed.
        </p>
      </section>

      {errorMessage ? (
        <div className="gf-notice border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="gf-notice border-emerald-200 bg-emerald-50 text-emerald-700">
          <div>{successMessage}</div>
          {intentId ? <div className="mt-1 font-mono text-xs">{intentId}</div> : null}
        </div>
      ) : null}

      <CheckoutRedirectButton disabled={!selectedFundId || amount <= 0} isLoading={isSubmitting} />
    </form>
  );
}
