import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { AddUserToConversationInput } from '@src/modules/conversation/addUserToConversation/add-user-to-conversation.input'
import { checkUserInConversation } from '@src/utils/conversation/check-user-in-conversation'

const kickUserFromConversationSchema = yup.object().shape({
  conversationId: yup.number().min(0),
  userId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Mutation: {
    kickUserFromConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: AddUserToConversationInput },
        context: Context
      ) => {
        const { conversationId, userId } = args.data

        try {
          await kickUserFromConversationSchema.validate(args.data, {
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

        if (parseInt(context.userId) === userId) {
          throw new ApolloError('Cannot kick yourself from conversation')
        }

        await checkUserInConversation(
          context,
          conversationId,
          'Cannot kick user from conversation'
        )

        try {
          await context.prisma.conversationUser.delete({
            where: {
              userId_conversationId: {
                userId,
                conversationId,
              },
            },
          })
        } catch (err) {
          throw new ApolloError('Cannot kick user from conversation')
        }

        return true
      }
    ),
  },
}

export default resolvers
