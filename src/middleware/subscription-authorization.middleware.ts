import { ApolloError } from 'apollo-server-core'
import { Resolver } from '@src/utils/graphql-types'
import { sessionUserId } from '@src/constants/session.const'
import { pubsub } from '@src/utils/pubsub'
import { prismaClient } from '@src/utils/prisma'

export const subscriptionAuthorization = (
  resolver: Resolver,
  root: any,
  args: any,
  context: any,
  info: any
) => {
  if (!context.req.session[sessionUserId]) {
    throw new ApolloError('Authorization failed')
  }
  context.userId = context.req.session[sessionUserId]
  context.pubsub = pubsub
  context.prisma = prismaClient

  return resolver(root, args, context, info)
}
