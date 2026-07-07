import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

const prismaThis = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({ connectionString });

const prisma = prismaThis.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  prismaThis.prisma = prisma;
}

export default prisma;
