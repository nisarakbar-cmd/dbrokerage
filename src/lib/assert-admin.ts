import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Admin access required.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Every Server Action that mutates admin data must call this first — the
 * middleware only gates page navigation, so actions re-check independently
 * rather than trusting the client (§12).
 */
export async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new UnauthorizedError();
  }
  return session.user;
}
