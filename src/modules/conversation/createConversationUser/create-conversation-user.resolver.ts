import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { CreateConversationUserInput } from '@src/modules/conversation/createConversationUser/create-conversation-user.input'
import { formatYupError } from '@src/utils/format-yup-error'

const createConversationUserSchema = yup.object().shape({
  conversationId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Mutation: {
    createConversationUser: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: CreateConversationUserInput },
        context: Context
      ) => {
        const { conversationId } = args.data

        try {
          await createConversationUserSchema.validate(args.data, {
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

        if (conversationWithUser.length) {
          throw new ApolloError('User already in conversation')
        }

        // TODO: try-catch
        const conversationUser = await context.prisma.conversationUser.create({
          data: {
            user: {
              connect: { id: parseInt(context.userId) },
            },
            conversation: {
              connect: { id: conversationId },
            },
          },
        })

        if (!conversationUser) {
          throw new ApolloError('Cannot add user to conversation')
        }

        return true
      }
    ),
  },
}

export default resolvers
