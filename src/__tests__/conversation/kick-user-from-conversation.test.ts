import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { kickUserFromConversation } from '@src/__tests__/utils/mutations';

const client = new PrismaClient()
const redis = new Redis()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const secondUserEmail = 'test2@mail.com'
const secondUserId = 2

const conversationId = 1
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

  await client.conversationUser.create({
    data: {
      user: {
        connect: { id: secondUserId },
      },
      conversation: {
        connect: { id: conversationId },
      },
    },
  })
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Kick user from conversation', () => {
  test('Check kicking', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: kickUserFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
          userId: secondUserId
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: true,
      },
    })

    expect(res.data.kickUserFromConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.participants.length).toBe(1)
  })

  test('Check kick yourself', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: kickUserFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
          userId
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: true,
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot kick yourself from conversation')
    expect(conversation).toBeDefined()
    expect(conversation!.participants.length).toBe(1)
  })

  test('Check kick from wrong conversation', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: secondUserId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: kickUserFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
          userId
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: true,
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot kick user from conversation')
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
      mutation: kickUserFromConversation,
      variables: {
        data: {
          conversationId: conversationId,
          userId: secondUserId
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
