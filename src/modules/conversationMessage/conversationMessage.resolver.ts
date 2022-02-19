import { ResolverMap } from '@src/utils/graphql-types'

const resolvers: ResolverMap = {
  ConversationMessage: {
    author: ({ userId }, _, { userLoader }) => userLoader.load(userId),
  },
}

export default resolvers
