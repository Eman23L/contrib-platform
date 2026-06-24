"use client";

import Link from "next/link";
import { useState } from "react";

type UnifiedSignInCardProps = {
  adminNextPath: string;
  guestHref: string;
  initialError?: string | null;
  publicNextPath: string;
  startNextPath?: string;
};

type StartSignInResponse =
  | {
      error?: string;
      ok: false;
    }
  | {
      mode: "magic_link_sent" | "password" | "redirect";
      next?: string;
      ok: true;
    };

type AdminSignInResponse = {
  error?: string;
  next?: string;
  ok?: boolean;
};

const SUCCESS_MESSAGE = "Check your email - we've sent you a secure sign-in link.";

function getFriendlyError(error?: string) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (
    error === "Invalid email or password." ||
    error.includes("active admin role")
  ) {
    return "We couldn't sign you in. Please check your details and try again.";
  }

  return error;
}

export function UnifiedSignInCard({
  adminNextPath,
  guestHref,
  initialError = null,
  publicNextPath,
  startNextPath = publicNextPath,
}: UnifiedSignInCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function startSignIn() {
    const response = await fetch("/auth/start", {
      body: JSON.stringify({
        email,
        next: startNextPath,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json()) as StartSignInResponse;

    if (payload.ok !== true) {
      setErrorMessage(getFriendlyError(payload.error));
      return;
    }

    if (payload.mode === "password") {
      setShowPasswordField(true);
      return;
    }

    if (payload.mode === "redirect") {
      window.location.assign(payload.next ?? publicNextPath);
      return;
    }

    setSuccessMessage(SUCCESS_MESSAGE);
  }

  async function signInWithPassword() {
    const response = await fetch("/auth/sign-in", {
      body: JSON.stringify({
        email,
        next: adminNextPath,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const payload = (await response.json()) as AdminSignInResponse;

    if (!response.ok || !payload.ok) {
      setErrorMessage(getFriendlyError(payload.error));
      return;
    }

    window.location.assign(payload.next ?? adminNextPath);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (showPasswordField) {
        await signInWithPassword();
      } else {
        await startSignIn();
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="gf-card w-full p-6 sm:p-8">
      <div className="mx-auto max-w-md">
        <p className="gf-kicker">Welcome to GetFlow</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Sign in to your account
        </h1>

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="gf-label">Email address</span>
            <input
              autoComplete="email"
              className="gf-input"
              onChange={(event) => {
                setEmail(event.target.value);
                setShowPasswordField(false);
                setPassword("");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>

          {showPasswordField ? (
            <label className="block">
              <span className="gf-label">Password</span>
              <input
                autoComplete="current-password"
                className="gf-input"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </label>
          ) : null}

          {errorMessage ? (
            <div
              aria-live="polite"
              className="gf-notice border-red-200 bg-red-50 text-red-700"
            >
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div
              aria-live="polite"
              className="gf-notice border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              {successMessage}
            </div>
          ) : null}

          <button
            className="gf-button-primary w-full"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Please wait..."
              : showPasswordField
                ? "Sign in securely"
                : "Continue"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link className="gf-link" href={guestHref}>
            Continue as guest
          </Link>
        </div>
      </div>
    </section>
  );
}
