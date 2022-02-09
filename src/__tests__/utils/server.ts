import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@src/utils/generate/generate-typedefs'
import { resolvers } from '@src/utils/generate/generate-resolvers'
import { sessionUserId } from '@src/constants/session.const'

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export const constructTestServer = (ctx: any) => {
  const server = new ApolloServer({
    schema,
    context: ({ res }) => {
      const req = {
        session: {
          sessionUserId: 1
        }
      }

      return { req, res, ...ctx }
    },
  })

  return { server }
}
