import { PrismaClient } from '@prisma/client'
import { sessionUserId } from '@src/constants/session.const'

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  req: Request
  res: Response
  userId: string | null
}

export const context = (ctx: Context) => {
  const context = ctx
  ctx.prisma = prisma

  // @ts-ignore
  if (ctx.req.session[sessionUserId]) {
    // @ts-ignore
    context.userId = ctx.req.session[sessionUserId]
  }

  return context
}
