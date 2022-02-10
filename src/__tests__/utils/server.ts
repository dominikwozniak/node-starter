import { ApolloServer } from 'apollo-server-express'
import { schema } from '@src/utils/generate/generate-schema'

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
