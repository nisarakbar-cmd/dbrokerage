import { db } from "@/lib/db";

interface RateLimitParams {
  phone?: string;
  ip?: string;
}

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * DB-backed count-over-window limiter for OTP requests (§8) — counts prior
 * OtpChallenge rows for the given phone/ip within the window. A plain count
 * query rather than an in-memory bucket, so it holds across server
 * instances/restarts.
 */
export async function checkOtpRateLimit(
  params: RateLimitParams,
  { limit, windowMs }: RateLimitOptions
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);
  const count = await db.otpChallenge.count({
    where: {
      createdAt: { gte: windowStart },
      ...(params.phone ? { phone: params.phone } : {}),
      ...(params.ip ? { ip: params.ip } : {}),
    },
  });
  return count < limit;
}
