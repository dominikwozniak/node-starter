import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { joinToConversation } from '@src/__tests__/utils/mutations'

const client = new PrismaClient()
const redis = new Redis()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const secondUserEmail = 'test2@mail.com'
const secondUserId = 2

const publicConversationId = 1
const privateConversationId = 2
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

describe('Join to conversation', () => {
  test('Check joining', async () => {
    const { server } = constructTestServer({ prisma: client, userId: secondUserId, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: joinToConversation,
      variables: {
        data: {
          conversationId: publicConversationId,
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: publicConversationId,
      },
      include: {
        participants: true
      }
    })

    expect(res.data.joinToConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.participants.length).toBe(2)
    expect(conversation!.participants[1].userId).toBe(secondUserId)
  })

  test('Check private conversation joining', async () => {
    const { server } = constructTestServer({ prisma: client, userId: secondUserId, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: joinToConversation,
      variables: {
        data: {
          conversationId: privateConversationId,
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: privateConversationId,
      },
      include: {
        participants: true
      }
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot join to private conversation')
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
      mutation: joinToConversation,
      variables: {
        data: {
          conversationId: publicConversationId
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
