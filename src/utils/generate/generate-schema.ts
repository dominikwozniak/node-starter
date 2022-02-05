import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@src/utils/generate/generate-typedefs'
import { resolvers } from '@src/utils/generate/generate-resolvers'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
