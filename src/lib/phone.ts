// Pakistani mobile numbers only, normalized to E.164 (+92XXXXXXXXXX) for
// storage and OTP challenge matching.
const LOCAL_FORMAT = /^03\d{9}$/; // 03XXXXXXXXX (11 digits)
const E164_FORMAT = /^\+923\d{9}$/; // +923XXXXXXXXX
const NO_PLUS_FORMAT = /^923\d{9}$/; // 923XXXXXXXXX

export function normalizePakistaniPhone(raw: string): string | null {
  const trimmed = raw.replace(/[\s-]/g, "");

  if (LOCAL_FORMAT.test(trimmed)) return `+92${trimmed.slice(1)}`;
  if (E164_FORMAT.test(trimmed)) return trimmed;
  if (NO_PLUS_FORMAT.test(trimmed)) return `+${trimmed}`;
  return null;
}
