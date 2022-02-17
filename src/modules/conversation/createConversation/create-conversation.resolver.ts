import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'

const resolvers: ResolverMap = {
  Mutation: {
    createConversation: applyMiddleware(
      authorization,
      async (_parent, _args, context: Context) => {
        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        // TODO: try-catch
        const conversation = await context.prisma.conversation.create({
          data: {
            participants: {
              create: {
                user: {
                  connect: { id: parseInt(context.userId) },
                },
              },
            },
          },
          include: {
            participants: true,
            messages: true,
          },
        })

        if (!conversation) {
          throw new ApolloError('Cannot create conversation')
        }

        return conversation
      }
    ),
  },
}

export default resolvers
