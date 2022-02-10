import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { forgotPasswordMutation } from '@src/__tests__/utils/mutations'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'
const wrongEmail = 'wrong@mail.com'
const invalidEmail = 'mail'

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

describe('Forgot password', () => {
  test('Check forgot password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: forgotPasswordMutation,
      variables: {
        data: {
          email: userEmail,
        },
      },
    })

    expect(res.data).toBeDefined()
    expect(res.data.forgotPassword).toBeTruthy()
  })

  test('Check not found email forgot password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: forgotPasswordMutation,
      variables: {
        data: {
          email: wrongEmail,
        },
      },
    })

    expect(res.data).toBeDefined()
    expect(res.data.forgotPassword).toBeFalsy()
  })

  test('Check invalid email forgot password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: forgotPasswordMutation,
      variables: {
        data: {
          email: invalidEmail,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot reset password with provided email'
    )

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'email',
      message: 'email must be a valid email',
    })
  })
})
