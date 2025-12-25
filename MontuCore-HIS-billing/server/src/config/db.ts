import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Reuse the existing instance if available, or create a new one
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'], // Optional: nice logs
  });

// Save the instance to the global scope in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
