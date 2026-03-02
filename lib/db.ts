import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () =>
  new PrismaClient().$extends(withAccelerate()) as unknown as PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
