import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { addUserToConversation, joinToConversation } from '@src/__tests__/utils/mutations';

const client = new PrismaClient()
const redis = new Redis()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const secondUserEmail = 'test2@mail.com'
const secondUserId = 2
const thirdUserEmail = 'test3@mail.com'
const thirdUserId = 3

const publicConversationId = 1
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

  await client.user.create({
    data: {
      name: userName,
      email: thirdUserEmail,
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

describe('Add user to conversation', () => {
  test('Check adding user', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: addUserToConversation,
      variables: {
        data: {
          conversationId: publicConversationId,
          userId: secondUserId
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: publicConversationId,
      },
      include: {
        participants: true,
      },
    })

    expect(res.data.addUserToConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.participants.length).toBe(2)
    expect(conversation!.participants[1].userId).toBe(secondUserId)
  })

  test('Check adding user from invalid account', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: thirdUserId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: addUserToConversation,
      variables: {
        data: {
          conversationId: publicConversationId,
          userId: thirdUserId
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot add new user from this account')
  })

  test('Check adding user if user already added', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: addUserToConversation,
      variables: {
        data: {
          conversationId: publicConversationId,
          userId: secondUserId
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Cannot add users to conversation')
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
      mutation: addUserToConversation,
      variables: {
        data: {
          conversationId: publicConversationId,
          userId: thirdUserId
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
