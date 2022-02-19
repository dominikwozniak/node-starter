import { ResolverMap } from '@src/utils/graphql-types'

const resolvers: ResolverMap = {
  ConversationUser: {
    user: ({ userId }, _, { userLoader }) => userLoader.load(userId),
  },
}

export default resolvers
