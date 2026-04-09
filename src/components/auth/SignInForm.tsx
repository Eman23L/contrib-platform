"use client";

import { useState } from "react";

type SignInFormProps = {
  buttonText?: string;
  inputLabel?: string;
  nextPath: string;
  placeholder?: string;
  successMessage?: string;
};

type SignInResponse = {
  error?: string;
  ok?: boolean;
};

export function SignInForm({
  buttonText = "Email me a sign-in link",
  inputLabel = "Admin email",
  nextPath,
  placeholder = "admin@example.com",
  successMessage = "Check your email for the secure sign-in link.",
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successStateMessage, setSuccessStateMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessStateMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/magic-link", {
        body: JSON.stringify({
          email,
          next: nextPath,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as SignInResponse;

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Could not send the sign-in link.");
        return;
      }

      setSuccessStateMessage(successMessage);
    } catch {
      setErrorMessage("Something went wrong while sending the sign-in link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-black/70">{inputLabel}</span>
        <input
          autoComplete="email"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink shadow-sm outline-none transition placeholder:text-black/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          required
          type="email"
          value={email}
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successStateMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successStateMessage}
        </div>
      ) : null}

      <button
        className="w-full rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-black/20 disabled:shadow-none"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending link..." : buttonText}
      </button>
    </form>
  );
}
