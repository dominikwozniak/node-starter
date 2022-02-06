import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { sessionUserId } from '@src/constants/session.const'
import { redis } from '@src/utils/redis'
import { prismaClient } from '@src/utils/prisma'

export interface Context {
  prisma: PrismaClient
  redis: Redis
  req: Request
  res: Response
  userId: string | null
}

export const context = (ctx: Context) => {
  const context = ctx
  ctx.prisma = prismaClient
  ctx.redis = redis

  // @ts-ignore
  if (ctx.req.session[sessionUserId]) {
    // @ts-ignore
    context.userId = ctx.req.session[sessionUserId]
  }

  return context
}
