import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // В новых версиях Prisma сама подхватит конфиг, 
    // но если будут ошибки, можно явно передать параметры здесь
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma