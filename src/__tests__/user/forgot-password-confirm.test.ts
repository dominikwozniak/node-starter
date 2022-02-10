import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { forgotPasswordConfirmMutation } from '@src/__tests__/utils/mutations'
import { generateForgotToken } from '@src/utils/generate/generate-forgot-token'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'
const newPassword = 'Test321'
const wrongToken = 'wrong-token'
const invalidPassword = 'te'

const token = 'test-token'
const forgotToken = generateForgotToken(token)

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

beforeEach(async () => {
  await redis.set(forgotToken, userEmail)
})

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Forgot password', () => {
  test('Check forgot password confirm', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: forgotPasswordConfirmMutation,
      variables: {
        data: {
          password: newPassword,
          token,
        },
      },
    })

    expect(res.data).toBeDefined()
    expect(res.data.forgotPasswordConfirm).toBeTruthy()
  })

  test('Check wrong token', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: forgotPasswordConfirmMutation,
      variables: {
        data: {
          password: newPassword,
          token: wrongToken,
        },
      },
    })

    expect(res.data).toBeDefined()
    expect(res.data.forgotPasswordConfirm).toBeFalsy()
  })

  test('Check invalid password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: forgotPasswordConfirmMutation,
      variables: {
        data: {
          password: invalidPassword,
          token,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot reset password with provided data'
    )

    expect(res.errors![0].extensions).toBeDefined()
    expect(res.errors![0].extensions![0]).toBeDefined()

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'password',
      message: 'password must be at least 3 characters',
    })
  })
})
