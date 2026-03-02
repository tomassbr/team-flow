import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const PUBLIC_PATHS = ["/login", "/onboarding"];
const AUTH_API_PREFIX = "/api/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: tady bude DB kontrola
        if (
          credentials?.email === "admin@admin.com" &&
          credentials?.password === "admin"
        ) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@admin.com",
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith(AUTH_API_PREFIX)) return true;
      if (PUBLIC_PATHS.includes(pathname)) return true;

      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyId = null;
        token.role = "MEMBER";
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
