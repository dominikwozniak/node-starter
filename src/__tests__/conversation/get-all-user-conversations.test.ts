import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { getAllUserConversations } from '@src/__tests__/utils/queries';

const client = new PrismaClient()
const redis = new Redis()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const secondUserEmail = 'test2@mail.com'
const secondUserId = 2

const firstConversationName = 'test conversation'
const secondConversationName = 'test conversation 2'

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
      name: firstConversationName,
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
      name: secondConversationName,
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

describe('Get all users conversations', () => {
  test('Check get all conversations', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: userId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: getAllUserConversations,
    })

    expect(res.data.getAllUserConversations.length).toBe(2)
    expect(res.data.getAllUserConversations[0].name).toBe(firstConversationName)
    expect(res.data.getAllUserConversations[1].name).toBe(secondConversationName)
  })

  test('Check get empty conversations', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: secondUserId,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: getAllUserConversations,
    })

    expect(res.data.getAllUserConversations.length).toBe(0)
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
      mutation: getAllUserConversations,
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
