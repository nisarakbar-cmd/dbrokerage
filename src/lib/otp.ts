import crypto from "node:crypto";

export const OTP_CODE_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_REQUEST_LIMIT_PER_PHONE = 3;
export const OTP_REQUEST_LIMIT_PER_IP = 10;
export const OTP_REQUEST_WINDOW_MS = 10 * 60 * 1000;

export function generateOtpCode(): string {
  return crypto
    .randomInt(0, 10 ** OTP_CODE_LENGTH)
    .toString()
    .padStart(OTP_CODE_LENGTH, "0");
}

// A fast hash is intentionally sufficient here: the real defenses against a
// 6-digit code are expiry, the attempt cap, and rate limiting — not the
// hash's compute cost (unlike a password hash, which must resist offline
// brute force on its own).
export function hashOtpCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}
