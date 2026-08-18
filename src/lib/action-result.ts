// Next.js redacts thrown Error messages from Server Actions in production
// builds (the client only receives an opaque digest) — so every mutation
// in this app returns a typed result instead of throwing for expected,
// user-actionable failures (validation, gating rules, not-found). Actual
// throws are reserved for truly unexpected bugs (a generic client-side
// fallback message is acceptable there) and for assertAdmin(), which is a
// security/redirect case rather than a message the user needs to read.
export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };
