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
  buttonText = "Send secure link",
  inputLabel = "Email address",
  nextPath,
  placeholder = "admin@example.com",
  successMessage = "Check your email for a secure sign-in link.",
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
        <span className="gf-label">{inputLabel}</span>
        <input
          autoComplete="email"
          className="gf-input"
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          required
          type="email"
          value={email}
        />
      </label>

      {errorMessage ? (
        <div className="gf-notice border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successStateMessage ? (
        <div className="gf-notice border-emerald-200 bg-emerald-50 text-emerald-700">
          {successStateMessage}
        </div>
      ) : null}

      <button
        className="gf-button-primary w-full"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Sending secure link..." : buttonText}
      </button>
    </form>
  );
}
