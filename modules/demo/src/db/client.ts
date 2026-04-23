import { PrismaClient } from "../generated/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma =
    globalForPrisma.__prisma ??
    new PrismaClient({
        adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL_POOLER! })
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma = prisma;
}
