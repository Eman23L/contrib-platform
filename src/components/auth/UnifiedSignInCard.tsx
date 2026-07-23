"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UnifiedSignInCardProps = {
  adminNextPath: string;
  guestHref?: string | null;
  initialError?: string | null;
  intro?: string;
  kicker?: string;
  publicNextPath: string;
  startNextPath?: string;
  title?: string;
};

type StartSignInResponse =
  | {
      error?: string;
      ok: false;
    }
  | {
      mode: "create_account_prompt" | "magic_link_sent" | "password" | "redirect";
      next?: string;
      ok: true;
    };

type AdminSignInResponse = {
  error?: string;
  next?: string;
  ok?: boolean;
};

const SUCCESS_MESSAGE = "Check your email - we've sent you a secure sign-in link.";
const CREATE_ACCOUNT_MESSAGE =
  "No password is needed. We can email you a secure link to create or sign in to your supporter account.";

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
  intro,
  kicker = "Welcome to GetFlow",
  publicNextPath,
  startNextPath = publicNextPath,
  title = "Sign in to your account",
}: UnifiedSignInCardProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  async function startSignIn() {
    const response = await fetch("/auth/start", {
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        createAccount: showCreateAccountPrompt,
        next: showCreateAccountPrompt ? publicNextPath : startNextPath,
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
      setShowCreateAccountPrompt(false);
      setShowPasswordField(true);
      return;
    }

    if (payload.mode === "create_account_prompt") {
      setShowPasswordField(false);
      setShowCreateAccountPrompt(true);
      return;
    }

    if (payload.mode === "redirect") {
      window.location.assign(payload.next ?? publicNextPath);
      return;
    }

    setSuccessMessage(SUCCESS_MESSAGE);
    setCooldownSeconds(60);
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
    if (cooldownSeconds > 0) {
      return;
    }

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
        <p className="gf-kicker">{kicker}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        {intro ? (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {intro}
          </p>
        ) : null}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="gf-label">First name</span>
              <input autoComplete="given-name" className="gf-input" onChange={(event) => setFirstName(event.target.value)} placeholder="Sarah" required type="text" value={firstName} />
            </label>
            <label className="block">
              <span className="gf-label">Last name</span>
              <input autoComplete="family-name" className="gf-input" onChange={(event) => setLastName(event.target.value)} placeholder="Smith" required type="text" value={lastName} />
            </label>
          </div>
          <label className="block">
            <span className="gf-label">Email address</span>
            <input
              autoComplete="email"
              className="gf-input"
              onChange={(event) => {
                setEmail(event.target.value);
                setShowPasswordField(false);
                setShowCreateAccountPrompt(false);
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

          {showCreateAccountPrompt ? (
            <div
              aria-live="polite"
              className="gf-notice border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              {CREATE_ACCOUNT_MESSAGE}
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
            disabled={isSubmitting || cooldownSeconds > 0}
            type="submit"
          >
            {isSubmitting
              ? "Please wait..."
              : cooldownSeconds > 0
                ? `Link sent - try again in ${cooldownSeconds}s`
              : showPasswordField
                ? "Sign in securely"
                : showCreateAccountPrompt
                  ? "Email me a sign-in link"
                : "Continue"}
          </button>
        </form>

        {guestHref ? (
          <div className="mt-6 text-center">
            <Link className="gf-link" href={guestHref}>
              Continue as guest
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
