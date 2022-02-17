import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import {
  GetMessagesPaginatedFromConversationInput
} from '@src/modules/conversationMessage/getMessagesPaginatedFromConversation/get-messages-paginated-from-conversation.input';

const getMessagesPaginatedFromConversationSchema = yup.object().shape({
  conversationId: yup.number().min(0),
  skip: yup.number().min(0),
  take: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Query: {
    getMessagesPaginatedFromConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: GetMessagesPaginatedFromConversationInput },
        context: Context
      ) => {
        const { conversationId, skip, take } = args.data

        try {
          await getMessagesPaginatedFromConversationSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError('Cannot get messages', formatYupError(error))
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        // TODO: try-catch
        const messages = await context.prisma.conversationMessage.findMany({
          take,
          skip,
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            conversationId,
          },
          include: {
            author: true,
          },
        })

        return messages
      }
    ),
  },
}

export default resolvers
