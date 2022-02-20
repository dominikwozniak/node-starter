import { ResolverMap } from '@src/utils/graphql-types'

const resolvers: ResolverMap = {
  ConversationMessage: {
    author: ({ userId }, _, { userLoader }) => userLoader.load(userId),
    conversation: ({ conversationId }, _, { conversationLoader }) =>
      conversationLoader.load(conversationId),
  },
}

export default resolvers
