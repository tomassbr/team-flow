import { encode } from "@auth/core/jwt";
import { prisma } from "@/lib/db";

/**
 * The cookie name NextAuth uses for JWT sessions.
 * Mobile clients connect via HTTP (LAN/IP), so we always use the non-secure variant.
 * The web app uses __Secure- prefix over HTTPS — that's handled by NextAuth automatically.
 */
export const MOBILE_COOKIE_NAME = "authjs.session-token" as const;

/**
 * Find or create a user linked to a social provider account.
 * Mirrors what Auth.js PrismaAdapter does on web sign-in.
 */
export async function upsertProviderUser(params: {
  provider: "google" | "apple";
  providerAccountId: string;
  email: string | null;
  name: string | null;
  image: string | null;
}) {
  const { provider, providerAccountId, email, name, image } = params;

  // Look up by existing provider account link
  const existingAccount = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  });

  if (existingAccount) {
    return existingAccount.user;
  }

  // Look up by email (user may have signed in with another provider before)
  if (email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // Link this provider to the existing user
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          type: "oauth",
          provider,
          providerAccountId,
        },
      });
      if (name || image) {
        return prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: existingUser.name ?? name,
            image: existingUser.image ?? image,
          },
        });
      }
      return existingUser;
    }
  }

  // New user — create both User and Account in a transaction
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: email ?? `${provider}.${providerAccountId}@placeholder.teamflow`,
        name,
        image,
      },
    });
    await tx.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider,
        providerAccountId,
      },
    });
    return user;
  });
}

/**
 * Create an Auth.js-compatible encrypted JWT for a mobile session.
 * The returned token is sent by mobile as `Cookie: authjs.session-token=<token>`.
 * NextAuth's `auth()` function decodes it transparently — no API route changes needed.
 */
export async function createMobileSessionToken(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true, image: true, companyId: true, role: true },
  });

  return encode({
    token: {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.image,
      companyId: user.companyId,
      role: user.role,
    },
    secret: process.env.AUTH_SECRET!,
    salt: MOBILE_COOKIE_NAME,
  });
}
