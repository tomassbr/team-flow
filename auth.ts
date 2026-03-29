import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET env var is required");
}

// /login is the only truly public path — all other protected paths are handled
// by the authorized callback. /onboarding requires auth (redirect to /login if not signed in).
const PUBLIC_PATHS = ["/login"];
const AUTH_API_PREFIX = "/api/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.NODE_ENV === "development",

  providers: [
    // Google OAuth — requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in env.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Credentials provider — development only.
    // Set DEV_AUTH_EMAIL and DEV_AUTH_PASSWORD in .env.local to use it.
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Dev Credentials",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              const devEmail = process.env.DEV_AUTH_EMAIL;
              const devPassword = process.env.DEV_AUTH_PASSWORD;

              if (!devEmail || !devPassword) return null;
              if (
                credentials?.email !== devEmail ||
                credentials?.password !== devPassword
              ) {
                return null;
              }

              // Upsert the dev user so they have a real DB record with companyId/role.
              const user = await prisma.user.upsert({
                where: { email: devEmail },
                update: {},
                create: { email: devEmail, name: "Dev User" },
                select: { id: true, email: true, name: true },
              });

              return { id: user.id, email: user.email, name: user.name };
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    authorized({ request, auth: session }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith(AUTH_API_PREFIX)) return true;
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;

      return !!session?.user;
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, persist the user id into the token.
      if (user?.id) {
        token.id = user.id;
      }

      // Refresh companyId and role from DB on sign-in or explicit session update.
      // This keeps claims fresh after company creation or role changes without re-login.
      if (user || trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { companyId: true, role: true },
        });
        token.companyId = dbUser?.companyId ?? null;
        token.role = dbUser?.role ?? "MEMBER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.companyId = (token.companyId as string | null) ?? null;
        session.user.role = (token.role as "ADMIN" | "MEMBER") ?? "MEMBER";
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },
});
