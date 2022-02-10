import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { loginMutation } from '@src/__tests__/utils/mutations'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'
const wrongEmail = 'wrong@mail.com'
const wrongPassword = 'WrongPassword'
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

describe('Login user', () => {
  test('Check login', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: loginMutation,
      variables: {
        data: {
          email: userEmail,
          password: userPassword,
        },
      },
    })

    expect(res.data.loginUser.id).toBe(1)
    expect(res.data.loginUser.email).toBe(userEmail)
    expect(res.data.loginUser.name).toBe(userName)
  })

  test('Check not found email login', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: loginMutation,
      variables: {
        data: {
          email: wrongEmail,
          password: userPassword,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Invalid email or password')
    expect(res.errors![0].extensions!.code).toBe('BAD_USER_INPUT')
  })

  test('Check invalid email login', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: loginMutation,
      variables: {
        data: {
          email: invalidEmail,
          password: userPassword,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot login with provided credentials'
    )

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'email',
      message: 'email must be a valid email',
    })
  })

  test('Check wrong password login', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: loginMutation,
      variables: {
        data: {
          email: userEmail,
          password: wrongPassword,
        },
      },
    })

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe('Invalid email or password')
    expect(res.errors![0].extensions!.code).toBe('BAD_USER_INPUT')
  })
})
