import { makeExecutableSchema } from '@graphql-tools/schema'

import { typeDefs } from '@src/utils/generateTypeDefs'
import { resolvers } from '@src/utils/generateResolvers'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
