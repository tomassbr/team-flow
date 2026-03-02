import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId: string | null;
      role: "ADMIN" | "MEMBER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    companyId?: string | null;
    role?: "ADMIN" | "MEMBER";
  }
}
