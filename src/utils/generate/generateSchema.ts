import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@src/utils/generate/generateTypeDefs'
import { resolvers } from '@src/utils/generate/generateResolvers'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
