import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { PubSub } from 'graphql-subscriptions'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { sessionUserId } from '@src/constants/session.const'
import { redis } from '@src/utils/redis'
import { prismaClient } from '@src/utils/prisma'
import { pubsub } from '@src/utils/pubsub'

export interface Context {
  prisma: PrismaClient
  redis: Redis
  req: Request
  res: Response
  pubsub: PubSub | RedisPubSub
  userId: string | null
}

export const context = (ctx: Context) => {
  const context = ctx
  ctx.prisma = prismaClient
  ctx.redis = redis
  ctx.pubsub = pubsub

  // @ts-ignore
  if (ctx.req.session[sessionUserId]) {
    // @ts-ignore
    context.userId = ctx.req.session[sessionUserId]
  }

  return context
}
