import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { JoinToConversationInput } from '@src/modules/conversation/joinToConversation/join-to-conversation.input'
import { formatYupError } from '@src/utils/format-yup-error'
import { checkUserInConversation } from '@src/utils/conversation/check-user-in-conversation'

const joinToConversationSchema = yup.object().shape({
  conversationId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Mutation: {
    joinToConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: JoinToConversationInput },
        context: Context
      ) => {
        const { conversationId } = args.data

        try {
          await joinToConversationSchema.validate(args.data, {
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

        const privateConversation =
          await context.prisma.conversation.findUnique({
            where: {
              id: conversationId,
            },
          })

        if (privateConversation?.isPrivate) {
          throw new ApolloError('Cannot join to private conversation')
        }

        try {
          await context.prisma.conversationUser.create({
            data: {
              user: {
                connect: { id: parseInt(context.userId) },
              },
              conversation: {
                connect: { id: conversationId },
              },
            },
          })
        } catch (error) {
          throw new ApolloError('Cannot add user to conversation')
        }

        return true
      }
    ),
  },
}

export default resolvers
