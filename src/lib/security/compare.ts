import { createHash, timingSafeEqual } from "crypto";

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function safeCompareText(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}
