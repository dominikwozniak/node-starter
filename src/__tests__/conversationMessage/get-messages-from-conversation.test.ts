import Redis from 'ioredis'
import argon2 from 'argon2'
import { PubSub } from 'graphql-subscriptions'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { getMessagesFromConversation } from '@src/__tests__/utils/queries'

const client = new PrismaClient()
const redis = new Redis()
const pubsub = new PubSub()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const secondUserId = 2

const conversationId = 1
const conversationName = 'test conversation'

const firstMessageText = 'Hello world'
const secondMessageText = 'Hello world 2'

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

  await client.conversationMessage.create({
    data: {
      text: firstMessageText,
      author: {
        connect: {
          id: userId,
        },
      },
      conversation: {
        connect: {
          id: conversationId,
        },
      },
    },
    include: {
      author: true,
      conversation: true,
    },
  })
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Get messages from a conversation', () => {
  test('Check getting messages', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId,
      redis,
      pubsub,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: getMessagesFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
        },
      },
    })

    expect(res.data.getMessagesFromConversation.length).toBe(1)
    expect(res.data.getMessagesFromConversation[0].text).toBe(firstMessageText)
    expect(res.data.getMessagesFromConversation[0].author.id).toBe(userId)
    expect(res.data.getMessagesFromConversation[0].author.email).toBe(userEmail)
    expect(res.data.getMessagesFromConversation[0].author.name).toBe(userName)
  })

  test('Check second message', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId,
      redis,
      pubsub,
    })

    await client.conversationMessage.create({
      data: {
        text: secondMessageText,
        author: {
          connect: {
            id: userId,
          },
        },
        conversation: {
          connect: {
            id: conversationId,
          },
        },
      },
      include: {
        author: true,
        conversation: true,
      },
    })

    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: getMessagesFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
        },
      },
    })

    expect(res.data.getMessagesFromConversation.length).toBe(2)
    expect(res.data.getMessagesFromConversation[0].text).toBe(secondMessageText)
    expect(res.data.getMessagesFromConversation[0].author.id).toBe(userId)
    expect(res.data.getMessagesFromConversation[0].author.email).toBe(userEmail)
    expect(res.data.getMessagesFromConversation[0].author.name).toBe(userName)
  })

  test('Check getting messages with wrong user', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: secondUserId,
      redis,
      pubsub,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: getMessagesFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot get messages from this conversation'
    )
  })

  test('Check auth failed', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: null,
      redis,
      pubsub,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: getMessagesFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
