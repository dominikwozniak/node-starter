import { ApolloServer } from 'apollo-server-express'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { PubSub } from 'graphql-subscriptions'
import { schema } from '@src/utils/generate/generate-schema'
import { createTestClient } from 'apollo-server-testing'

interface TestContext {
  prisma: PrismaClient
  userId: number | null
  redis: Redis
  pubsub: PubSub
}

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

// TODO: all test cases with test client
export const testClient = (context: Partial<TestContext>) => {
  const { server } = constructTestServer({ ...context })
  // @ts-ignore
  const { mutate } = createTestClient(server)

  return mutate
}
