import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { CreateMessageInput } from '@src/modules/conversationMessage/createMessage/create-message.input'
import { PUBSUB_NEW_MESSAGE } from '@src/constants/pubsub.const'

const createMessageSchema = yup.object().shape({
  conversationId: yup.number().min(0),
  text: yup.string().min(1),
})

const resolvers: ResolverMap = {
  Mutation: {
    createMessage: applyMiddleware(
      authorization,
      async (_parent, args: { data: CreateMessageInput }, context: Context) => {
        const { conversationId, text } = args.data

        try {
          await createMessageSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError('Cannot send message', formatYupError(error))
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        // TODO: try-catch
        const message = await context.prisma.conversationMessage.create({
          data: {
            text,
            author: {
              connect: {
                id: parseInt(context.userId),
              },
            },
            conversation: {
              connect: {
                id: conversationId,
              },
            },
          },
          include: {
            author: true,
            conversation: true,
          },
        })

        await context.pubsub.publish(PUBSUB_NEW_MESSAGE, {
          newMessage: message,
        })

        return true
      }
    ),
  },
}

export default resolvers
