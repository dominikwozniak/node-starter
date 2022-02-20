import { ResolverMap } from '@src/utils/graphql-types'

const resolvers: ResolverMap = {
  ConversationUser: {
    user: ({ userId }, _, { userLoader }) => userLoader.load(userId),
    conversation: ({ conversationId }, _, { conversationLoader }) =>
      conversationLoader.load(conversationId),
  },
}

export default resolvers
