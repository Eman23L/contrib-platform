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
  if (!path || !path.startsWith("/")) {
    return "/";
  }

  return path;
}

export function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  return normalizeOrigin(request.url) ?? getConfiguredAppOrigin() ?? "http://localhost:3000";
}

export function buildRequestUrl(request: Request, path: string) {
  return new URL(path, getRequestOrigin(request));
}
