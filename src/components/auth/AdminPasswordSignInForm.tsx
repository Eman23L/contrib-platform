"use client";

import { useState } from "react";

type AdminPasswordSignInFormProps = {
  nextPath: string;
};

type AdminSignInResponse = {
  error?: string;
  next?: string;
  ok?: boolean;
};

export function AdminPasswordSignInForm({
  nextPath,
}: AdminPasswordSignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/sign-in", {
        body: JSON.stringify({
          email,
          next: nextPath,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as AdminSignInResponse;

      if (!response.ok || !payload.ok) {
        setErrorMessage(payload.error ?? "Could not sign in.");
        return;
      }

      window.location.assign(payload.next ?? nextPath);
    } catch {
      setErrorMessage("Something went wrong while signing in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="gf-label">
          Email address
        </span>
        <input
          autoComplete="email"
          className="gf-input"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.org"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="block">
        <span className="gf-label">
          Password
        </span>
        <span className="relative block">
          <input
            autoComplete="current-password"
            className="gf-input pr-20"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type={isPasswordVisible ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-semibold text-[#5f7f66] transition hover:bg-accentSoft hover:text-[#446b4b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            type="button"
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        </span>
      </label>

      {errorMessage ? (
        <div
          aria-live="polite"
          className="gf-notice border-red-200 bg-red-50 text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <button
        className="gf-button-primary w-full"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Continue securely"}
      </button>

      <p className="text-center text-sm leading-6 text-slate-500">
        Use the email and password connected to your GetFlow account.
      </p>
    </form>
  );
}
