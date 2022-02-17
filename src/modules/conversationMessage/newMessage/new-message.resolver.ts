import { ApolloError } from 'apollo-server-core'
import { ResolverMap } from '@src/utils/graphql-types'
import { withFilter } from 'graphql-subscriptions'
import { pubsub } from '@src/utils/pubsub'
import { PUBSUB_NEW_MESSAGE } from '@src/constants/pubsub.const'
import { NewMessageInput } from '@src/modules/conversationMessage/newMessage/new-message.input'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { subscriptionAuthorization } from '@src/middleware/subscription-authorization.middleware'

const resolvers: ResolverMap = {
  Subscription: {
    newMessage: {
      subscribe: applyMiddleware(
        subscriptionAuthorization,
        withFilter(
          (_parent, _args) => {
            return pubsub.asyncIterator(PUBSUB_NEW_MESSAGE)
          },
          async (payload, args: { data: NewMessageInput }, context) => {
            if (!context.userId) {
              throw new ApolloError('Authorization failed')
            }

            const isUserInConversation =
              await context.prisma.conversation.findFirst({
                where: {
                  id: payload.newMessage.conversationId,
                  participants: {
                    some: {
                      userId: parseInt(context.userId),
                    },
                  },
                },
              })

            return (
              isUserInConversation &&
              payload.newMessage.conversation.id === args.data.conversationId
            )
          }
        )
      ),
    },
  },
}

export default resolvers
