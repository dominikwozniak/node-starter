import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { UserInputError } from 'apollo-server';
import { formatYupError } from '@src/utils/format-yup-error';
import { LeaveConversationInput } from '@src/modules/conversation/leaveConversation/leave-conversation';

const leaveConversationSchema = yup.object().shape({
  conversationId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Mutation: {
    leaveConversation: applyMiddleware(
      authorization,
      async (_parent, args: { data: LeaveConversationInput }, context: Context) => {
        const { conversationId } = args.data

        try {
          await leaveConversationSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot add user to conversation',
            formatYupError(error)
          )
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        const conversationWithUser =
          await context.prisma.conversationUser.findMany({
            where: {
              userId: parseInt(context.userId),
              conversationId,
            },
          })

        if (!conversationWithUser.length) {
          throw new ApolloError('Cannot leave conversation')
        }

        try {
          await context.prisma.conversationUser.delete({
            where: {
              userId_conversationId: {
                userId: parseInt(context.userId),
                conversationId
              }
            }
          })
        } catch (error) {
          throw new ApolloError('Cannot leave conversation')
        }

        return true
      }
    ),
  },
}

export default resolvers
