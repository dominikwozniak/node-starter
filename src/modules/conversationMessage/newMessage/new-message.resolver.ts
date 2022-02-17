import { ResolverMap } from '@src/utils/graphql-types'
import { withFilter } from 'graphql-subscriptions'
import { pubsub } from '@src/utils/pubsub'
import { PUBSUB_NEW_MESSAGE } from '@src/constants/pubsub.const'
import { NewMessageInput } from '@src/modules/conversationMessage/newMessage/new-message.input'

const resolvers: ResolverMap = {
  Subscription: {
    newMessage: {
      // TODO: request / authentication
      subscribe: withFilter(
        (_parent, _args) => {
          return pubsub.asyncIterator(PUBSUB_NEW_MESSAGE)
        },
        (payload, args: { data: NewMessageInput }) => {
          return payload.newMessage.conversation.id === args.data.conversationId
        }
      ),
    },
  },
}

export default resolvers
