import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { createConversationMutation } from '@src/__tests__/utils/mutations'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

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
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Create conversation', () => {
  test('Check creating', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: createConversationMutation,
      variables: {
        data: {
          name: conversationName,
          isPrivate: false,
        },
      },
    })

    expect(res.data.createConversation.id).toBe(1)
    expect(res.data.createConversation.name).toBe(conversationName)
    expect(res.data.createConversation.isPrivate).toBe(false)
  })

  test('Check blank name creating', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: createConversationMutation,
      variables: {
        data: {
          isPrivate: true,
        },
      },
    })

    expect(res.data.createConversation.id).toBe(2)
    expect(res.data.createConversation.name).toBe(null)
    expect(res.data.createConversation.isPrivate).toBe(true)
  })

  test('Check blank isPrivate creating', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: createConversationMutation,
      variables: {
        data: {
          name: conversationName,
        },
      },
    })

    expect(res.data.createConversation.id).toBe(3)
    expect(res.data.createConversation.name).toBe(conversationName)
    expect(res.data.createConversation.isPrivate).toBe(false)
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
      mutation: createConversationMutation,
      variables: {
        data: {
          name: conversationName,
          isPrivate: false,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
