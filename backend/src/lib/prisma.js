import { PrismaClient } from "@prisma/client";

// A single shared PrismaClient instance. In dev with --watch this file can
// get re-imported; stashing the client on globalThis avoids exhausting the
// DB connection pool by opening a fresh one on every reload.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
