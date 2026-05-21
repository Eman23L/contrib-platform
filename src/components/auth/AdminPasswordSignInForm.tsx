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
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Email address
        </span>
        <input
          autoComplete="email"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.org"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </span>
        <span className="relative block">
          <input
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-20 text-base text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type={isPasswordVisible ? "text" : "password"}
            value={password}
          />
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      ) : null}

      <button
        className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-sky-500 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-white disabled:shadow-none disabled:hover:translate-y-0"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Open workspace"}
      </button>

      <p className="text-center text-sm leading-6 text-slate-500">
        Your session is protected and only authorised workspace members can
        continue.
      </p>
    </form>
  );
}
