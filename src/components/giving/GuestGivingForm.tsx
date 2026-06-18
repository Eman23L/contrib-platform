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

  const selectedFund = useMemo(
    () => organisation.funds.find((fund) => fund.id === selectedFundId) ?? null,
    [organisation.funds, selectedFundId],
  );

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
      setSuccessMessage("Taking you to secure checkout...");
      window.location.assign(data.checkoutUrl);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[#5f7f66]">Step 1</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Choose where your gift should go
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Pick the fund that best matches what you would like to support.
          </p>
        </div>
        <FundGrid
          funds={organisation.funds}
          onSelectFund={setSelectedFundId}
          selectedFundId={selectedFundId}
        />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[#5f7f66]">Step 2</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Select an amount
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
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

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[#5f7f66]">Step 3</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Send me a receipt
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add your email address if you would like a receipt for this gift.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Email address
          </span>
          <input
            autoComplete="email"
            className="w-full rounded-[1.25rem] border border-slate-200/80 bg-white px-4 py-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#7ca982] focus:ring-4 focus:ring-[#7ca982]/15"
            onChange={(event) => setGuestEmail(event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={guestEmail}
          />
        </label>
      </section>

      <section className="rounded-[1.5rem] border border-[#d8e9dc] bg-[#f7fbf6] px-5 py-4 shadow-sm">
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
          Your gift is processed securely. You will review the payment before it
          is completed.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
          <div>{successMessage}</div>
          {intentId ? <div className="mt-1 font-mono text-xs">{intentId}</div> : null}
        </div>
      ) : null}

      <CheckoutRedirectButton disabled={!selectedFundId || amount <= 0} isLoading={isSubmitting} />
    </form>
  );
}
