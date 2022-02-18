import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { UserInputError } from 'apollo-server'
import { formatYupError } from '@src/utils/format-yup-error'
import { CreateConversationInput } from '@src/modules/conversation/createConversation/create-conversation.input'

const createConversationSchema = yup.object().shape({
  name: yup.string(),
  private: yup.boolean(),
})

const resolvers: ResolverMap = {
  Mutation: {
    createConversation: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: CreateConversationInput },
        context: Context
      ) => {
        const { name, isPrivate } = args.data

        try {
          await createConversationSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot create conversation with provided data',
            formatYupError(error)
          )
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        // TODO: try-catch
        const conversation = await context.prisma.conversation.create({
          data: {
            name,
            isPrivate,
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
