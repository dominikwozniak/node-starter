import Redis from 'ioredis'
import argon2 from 'argon2'
import { PubSub } from 'graphql-subscriptions'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { createMessageMutation } from '@src/__tests__/utils/mutations'

const client = new PrismaClient()
const redis = new Redis()
const pubsub = new PubSub()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const conversationId = 1
const conversationName = 'test conversation'

const messageText = 'Hello world'

beforeAll(async () => {
  const hashedPassword = await argon2.hash(userPassword)
  await client.user.create({
    data: {
      name: userName,
      email: userEmail,
      password: hashedPassword,
      confirmed: true,
    },
  })

  await client.conversation.create({
    data: {
      name: conversationName,
      isPrivate: false,
      participants: {
        create: {
          user: {
            connect: { id: userId },
          },
        },
      },
    },
  })
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Create message', () => {
  test('Check creating message',async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId,
      redis,
      pubsub
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: createMessageMutation,
      variables: {
        data: {
          conversationId: conversationId,
          text: messageText
        },
      },
    })

    const messages = await client.conversationMessage.findMany({
      where: {
        conversationId
      },
      include: {
        author: true,
      },
    })

    expect(res.data.createMessage).toBeTruthy()
    expect(messages).toBeDefined()
    expect(messages!.length).toBe(1)
    expect(messages![0].text).toBe(messageText)
    expect(messages![0].author.id).toBe(userId)
    expect(messages![0].author.email).toBe(userEmail)
    expect(messages![0].author.name).toBe(userName)
  })

  test('Check no text in message',async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId,
      redis,
      pubsub
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: createMessageMutation,
      variables: {
        data: {
          conversationId: conversationId
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot send message')
  })

  test('Check auth failed', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: null,
      redis,
      pubsub
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: createMessageMutation,
      variables: {
        data: {
          conversationId: conversationId,
          text: messageText
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
