import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { loginMutation } from '@src/__tests__/utils/mutations'
import { whoAmI } from '@src/__tests__/utils/queries'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

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

describe('Who Am I', () => {
  test('Check user', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: whoAmI,
      variables: {
        data: {
          email: userEmail,
          password: userPassword,
        },
      },
    })

    expect(res.data.whoAmI.id).toBe(1)
    expect(res.data.whoAmI.email).toBe(userEmail)
    expect(res.data.whoAmI.name).toBe(userName)
  })

  test('Check wrong user id', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 2, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: whoAmI,
      variables: {
        data: {
          email: userEmail,
          password: userPassword,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Invalid user')
  })

  test('Check blank user id', async () => {
    const { server } = constructTestServer({
      prisma: client,
      userId: undefined,
      redis,
    })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: whoAmI,
      variables: {
        data: {
          email: userEmail,
          password: userPassword,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Authorization failed')
  })
})
