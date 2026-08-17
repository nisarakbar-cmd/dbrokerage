export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * Per-phone / per-IP limiter for OTP requests (§8). Stubbed with an
 * in-memory window for M0 — M3 backs this with OtpChallenge rows so it
 * survives across server instances.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): Promise<RateLimitResult> {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { success: false, remaining: 0 };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { success: true, remaining: limit - hits.length };
}

const buckets = new Map<string, number[]>();
