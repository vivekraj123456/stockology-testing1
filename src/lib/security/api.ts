import { NextResponse } from "next/server";

import { consumeRateLimit } from "@/lib/security/rateLimit";
import {
  getClientIpFromHeaders,
  isSameOriginRequest,
} from "@/lib/security/request";

type WriteGuardOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
};

export function guardWriteRequest(
  request: Request,
  options: WriteGuardOptions
): NextResponse | null {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Blocked by origin policy.",
      },
      { status: 403 }
    );
  }

  const clientIp = getClientIpFromHeaders(request.headers);
  const rate = consumeRateLimit({
    bucket: options.bucket,
    key: clientIp,
    limit: options.limit,
    windowMs: options.windowMs,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please retry later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
        },
      }
    );
  }

  return null;
}
