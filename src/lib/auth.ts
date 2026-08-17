import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  }
}

type AppJwt = JWT & { role?: string };

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.adminUser.findUnique({ where: { email } });
        if (!user || !user.active || user.role !== "ADMIN") return null;

        const valid = await verifyPassword(user.passwordHash, password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      const t = token as AppJwt;
      if (user) t.role = user.role;
      return t;
    },
    session({ session, token }) {
      const t = token as AppJwt;
      session.user.id = t.sub as string;
      session.user.role = t.role;
      return session;
    },
  },
});
