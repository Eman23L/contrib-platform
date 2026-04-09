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
        <span className="mb-2 block text-sm font-medium text-black/70">Email address</span>
        <input
          autoComplete="email"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink shadow-sm outline-none transition placeholder:text-black/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-black/70">Password</span>
        <input
          autoComplete="current-password"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-4 text-base text-ink shadow-sm outline-none transition placeholder:text-black/35 focus:border-accent focus:ring-2 focus:ring-accent/20"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          type="password"
          value={password}
        />
      </label>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        className="w-full rounded-2xl bg-accent px-5 py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-black/20 disabled:shadow-none"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
