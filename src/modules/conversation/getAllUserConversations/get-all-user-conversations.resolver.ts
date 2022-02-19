import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'

const resolvers: ResolverMap = {
  Query: {
    getAllUserConversations: applyMiddleware(
      authorization,
      async (_parent, _args, context: Context) => {
        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        try {
          return await context.prisma.conversation.findMany({
            where: {
              participants: {
                some: {
                  userId: parseInt(context.userId),
                },
              },
            },
            include: {
              participants: true,
              messages: {
                take: 1,
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          })
        } catch (error) {
          throw new ApolloError('Cannot get conversations')
        }
      }
    ),
  },
}

export default resolvers
