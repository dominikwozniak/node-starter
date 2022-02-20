import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { GetMessagesFromConversationInput } from '@src/modules/conversationMessage/getMessagesFromConversation/get-messages-from-conversation.input'
import { checkUserInConversation } from '@src/utils/conversation/check-user-in-conversation'

const getMessagesFromConversationSchema = yup.object().shape({
  conversationId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Query: {
    getMessagesFromConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: GetMessagesFromConversationInput },
        context: Context
      ) => {
        const { conversationId } = args.data

        try {
          await getMessagesFromConversationSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError('Cannot get messages', formatYupError(error))
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        await checkUserInConversation(
          context,
          conversationId,
          'Cannot get messages from this conversation'
        )

        try {
          return await context.prisma.conversationMessage.findMany({
            take: 10,
            orderBy: {
              createdAt: 'desc',
            },
            where: {
              conversationId,
            },
            // include: {
            //   author: true
            // },
          })
        } catch (error) {
          throw new ApolloError('Cannot get messages')
        }
      }
    ),
  },
}

export default resolvers
