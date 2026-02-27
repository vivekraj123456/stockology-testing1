type HeadersLike =
  | Headers
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}

function readRecordHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string
): string | null {
  const target = normalizeHeaderName(name);

  for (const [key, rawValue] of Object.entries(headers)) {
    if (normalizeHeaderName(key) !== target) {
      continue;
    }

    if (Array.isArray(rawValue)) {
      return rawValue[0] ?? null;
    }

    return rawValue ?? null;
  }

  return null;
}

function readHeader(headers: HeadersLike, name: string): string | null {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  return readRecordHeader(headers, name);
}

function pickForwardedIp(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(",")[0]?.trim();
  if (!first) {
    return null;
  }

  return first;
}

export function getClientIpFromHeaders(headers: HeadersLike): string {
  const forwarded = pickForwardedIp(readHeader(headers, "x-forwarded-for"));
  if (forwarded) {
    return forwarded;
  }

  const realIp = readHeader(headers, "x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cloudflareIp = readHeader(headers, "cf-connecting-ip");
  if (cloudflareIp) {
    return cloudflareIp.trim();
  }

  return "unknown";
}

function pickForwardedHost(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(",")[0]?.trim();
  return first || null;
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  const host =
    pickForwardedHost(request.headers.get("x-forwarded-host")) ??
    request.headers.get("host");

  if (!host) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}
