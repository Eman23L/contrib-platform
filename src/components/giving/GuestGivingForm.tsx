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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);
    setIntentId(null);

    if (!selectedFundId) {
      setErrorMessage("Choose a fund to continue.");
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
          guestEmail,
        }),
      });

      const data =
        (await response.json()) as CreateContributionIntentResponse;

      if (!response.ok || !data.ok) {
        setErrorMessage(
          data.ok ? "Could not create contribution intent." : data.error,
        );
        return;
      }

      setIntentId(data.intentId);
      setSuccessMessage("Redirecting to Stripe Checkout...");
      window.location.assign(data.checkoutUrl);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            1. Choose a fund
          </h2>
          <p className="mt-1 text-sm text-black/60">
            Select where you would like your contribution to go.
          </p>
        </div>
        <FundGrid
          funds={organisation.funds}
          onSelectFund={setSelectedFundId}
          selectedFundId={selectedFundId}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            2. Enter an amount
          </h2>
          <p className="mt-1 text-sm text-black/60">
            Pick a quick amount or type your own.
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

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            3. Receipt email
          </h2>
          <p className="mt-1 text-sm text-black/60">
            Optional. Add an email if you want a receipt later.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black/70">
            Email address
          </span>
          <input
            autoComplete="email"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink shadow-sm outline-none transition placeholder:text-black/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
            onChange={(event) => setGuestEmail(event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={guestEmail}
          />
        </label>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div>{successMessage}</div>
          {intentId ? <div className="mt-1 font-mono text-xs">{intentId}</div> : null}
        </div>
      ) : null}

      <CheckoutRedirectButton disabled={!selectedFundId || amount <= 0} isLoading={isSubmitting} />
    </form>
  );
}
