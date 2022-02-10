import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { confirmUser } from '@src/__tests__/utils/mutations'
import { generateConfirmToken } from '@src/utils/generate/generate-confirm-token'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'
const wrongToken = 'wrong-token'

const token = 'test-token'
const confirmToken = generateConfirmToken(token)

beforeAll(async () => {
  const hashedPassword = await argon2.hash(userPassword)
  await client.user.create({
    data: {
      name: userName,
      email: userEmail,
      password: hashedPassword,
      confirmed: false,
    },
  })
})

beforeEach(async () => {
  await redis.set(confirmToken, userEmail)
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Confirm user', () => {
  test('Check confirmation', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: confirmUser,
      variables: {
        data: {
          token,
        },
      },
    })

    expect(res.data.confirmUser).toBeTruthy()
  })

  test('Check wrong token', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: confirmUser,
      variables: {
        data: {
          token: wrongToken,
        },
      },
    })

    expect(res.data.confirmUser).toBeFalsy()
  })
})
