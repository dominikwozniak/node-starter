import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { AddUserToConversationInput } from '@src/modules/conversation/addUserToConversation/add-user-to-conversation.input'
import { checkUserInConversation } from '@src/utils/conversation/check-user-in-conversation';

const addConversationUsersSchema = yup.object().shape({
  conversationId: yup.number().min(0),
  userId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Mutation: {
    addUserToConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: AddUserToConversationInput },
        context: Context
      ) => {
        const { conversationId, userId } = args.data

        try {
          await addConversationUsersSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot add user to conversation',
            formatYupError(error)
          )
        }

        await checkUserInConversation(context, conversationId, 'Cannot add new user from this account')

        try {
          await context.prisma.user.findUnique({
            where: {
              id: userId,
            },
          })

          await context.prisma.conversationUser.create({
            data: {
              user: {
                connect: { id: userId },
              },
              conversation: {
                connect: { id: conversationId },
              },
            },
          })
        } catch (err) {
          throw new ApolloError('Cannot add users to conversation')
        }

        return true
      }
    ),
  },
}

export default resolvers
