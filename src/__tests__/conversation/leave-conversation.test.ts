import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { joinToConversation, leaveConversation } from '@src/__tests__/utils/mutations';

const client = new PrismaClient()
const redis = new Redis()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const secondUserEmail = 'test2@mail.com'
const secondUserId = 2

const firstConversationId = 1
const secondConversationId = 2
const conversationName = 'test conversation'

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

  await client.user.create({
    data: {
      name: userName,
      email: secondUserEmail,
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

  await client.conversation.create({
    data: {
      name: conversationName,
      isPrivate: true,
      participants: {
        create: {
          user: {
            connect: { id: secondUserId },
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

describe('Leave conversation', () => {
  test('Check leaving', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: leaveConversation,
      variables: {
        data: {
          conversationId: firstConversationId,
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: firstConversationId,
      },
      include: {
        participants: true,
      },
    })

    expect(res.data.leaveConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.participants.length).toBe(0)
  })

  test('Check leaving', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: leaveConversation,
      variables: {
        data: {
          conversationId: secondConversationId,
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: secondConversationId,
      },
      include: {
        participants: true,
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot leave conversation')
    expect(conversation).toBeDefined()
    expect(conversation!.participants.length).toBe(1)
  })

  test('Check auth failed', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: null,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: leaveConversation,
      variables: {
        data: {
          conversationId: firstConversationId,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
