import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";

// next-auth/jwt re-exports its JWT type via `export * from "@auth/core/jwt"`,
// which TypeScript can import fine but can't target with `declare module`
// augmentation — so a plain intersection type stands in for module
// augmentation here.
type AppJwt = JWT & { role?: string };

// Edge-safe half of the Auth.js split config (used by middleware, which
// runs on the Edge runtime). No providers here — Credentials.authorize()
// calls argon2.verify(), a native Node module that crashes on Edge. The
// Credentials provider is added only in auth.ts, which runs in the Node
// route handler / Server Actions runtime.
export const authConfig = {
  // Self-hosted (no platform like Vercel to auto-detect a trusted host from
  // VERCEL_URL) — trust the request Host header rather than requiring
  // AUTH_URL to be pinned to one deployment URL.
  trustHost: true,
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      const t = token as AppJwt;
      if (user) t.role = (user as { role?: string }).role;
      return t;
    },
    session({ session, token }) {
      const t = token as AppJwt;
      session.user.id = t.sub as string;
      session.user.role = t.role;
      return session;
    },
    authorized({ auth, request }) {
      const isAdmin = auth?.user?.role === "ADMIN";
      const { pathname } = request.nextUrl;

      if (pathname === "/admin/login") {
        // Already signed in as an admin — skip the login page.
        if (isAdmin) return Response.redirect(new URL("/admin/leads", request.nextUrl));
        return true;
      }

      if (pathname.startsWith("/admin")) return isAdmin;

      return true;
    },
  },
} satisfies NextAuthConfig;
