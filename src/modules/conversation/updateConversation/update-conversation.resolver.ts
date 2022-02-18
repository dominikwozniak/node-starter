import * as yup from 'yup'
import omit from 'lodash/omit'
import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { UserInputError } from 'apollo-server'
import { formatYupError } from '@src/utils/format-yup-error'
import { UpdateConversationInput } from '@src/modules/conversation/updateConversation/update-conversation.input'
import { checkUserInConversation } from '@src/utils/conversation/check-user-in-conversation';

const updateConversationSchema = yup.object().shape({
  conversationId: yup.number().min(0),
  name: yup.string().min(2).max(255),
  private: yup.boolean(),
})

const resolvers: ResolverMap = {
  Mutation: {
    updateConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: UpdateConversationInput },
        context: Context
      ) => {
        const { conversationId } = args.data

        try {
          await updateConversationSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot update conversation with provided data',
            formatYupError(error)
          )
        }
        await checkUserInConversation(context, conversationId, 'Cannot update conversation')

        try {
          await context.prisma.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              ...omit(args.data, ['conversationId']),
            },
          })
        } catch (error) {
          console.error(error)
          throw new ApolloError('Cannot update conversation')
        }

        return true
      }
    ),
  },
}

export default resolvers
