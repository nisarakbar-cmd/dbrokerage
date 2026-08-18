import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge runtime — built from the provider-less authConfig only, so no
// argon2 (see auth.config.ts). Gating logic lives in authConfig's
// `authorized` callback.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*"],
};
