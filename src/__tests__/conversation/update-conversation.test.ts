import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { createConversationMutation, updateConversationMutation } from '@src/__tests__/utils/mutations';

const client = new PrismaClient()
const redis = new Redis()

const userId = 1
const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const conversationId = 1
const conversationName = 'test conversation'
const isPrivate = true

const updatedConversationName = 'updated conversation'
const updatedIsPrivate = false

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
      isPrivate,
      participants: {
        create: {
          user: {
            connect: { id: userId },
          },
        },
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  })
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Create conversation', () => {
  test('Check updating', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateConversationMutation,
      variables: {
        data: {
          conversationId,
          name: updatedConversationName,
          isPrivate: updatedIsPrivate,
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: conversationId
      }
    })

    expect(res.data.updateConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.name).toBe(updatedConversationName)
    expect(conversation!.isPrivate).toBe(updatedIsPrivate)
  })

  test('Check name updating', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateConversationMutation,
      variables: {
        data: {
          conversationId,
          name: conversationName,
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: conversationId
      }
    })

    expect(res.data.updateConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.name).toBe(conversationName)
    expect(conversation!.isPrivate).toBe(updatedIsPrivate)
  })

  test('Check private updating', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateConversationMutation,
      variables: {
        data: {
          conversationId,
          isPrivate
        },
      },
    })

    const conversation = await client.conversation.findUnique({
      where: {
        id: conversationId
      }
    })

    expect(res.data.updateConversation).toBeTruthy()
    expect(conversation).toBeDefined()
    expect(conversation!.name).toBe(conversationName)
    expect(conversation!.isPrivate).toBe(isPrivate)
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
      mutation: updateConversationMutation,
      variables: {
        data: {
          conversationId,
          name: updatedConversationName,
          isPrivate: updatedIsPrivate,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
