import "server-only";

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getConfiguredAppOrigin() {
  const explicitOrigin =
    normalizeOrigin(process.env.APP_URL ?? "") ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL ?? "");

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return normalizeOrigin(`https://${vercelUrl}`);
  }

  return null;
}

export function getSafeInternalPath(path?: string | null) {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    return "/";
  }

  try {
    const url = new URL(path, "https://getflow.local");

    if (url.origin !== "https://getflow.local") {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function getRequestOrigin(request: Request) {
  // Checkout return URLs must use an operator-controlled origin. Do not build
  // payment URLs from forwarded headers supplied by the incoming request.
  return (
    getConfiguredAppOrigin() ??
    normalizeOrigin(request.url) ??
    "http://localhost:3000"
  );
}

export function buildRequestUrl(request: Request, path: string) {
  return new URL(path, getRequestOrigin(request));
}
