import { ApolloServer } from 'apollo-server-express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from '@src/utils/generate/generate-typedefs'
import { resolvers } from '@src/utils/generate/generate-resolvers'

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
          sessionUserId: ctx.userId || 1,
        },
      }

      return { req, res, ...ctx }
    },
  })

  return { server }
}
