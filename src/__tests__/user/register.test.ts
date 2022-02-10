import Redis from 'ioredis'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { registerMutation } from '@src/__tests__/utils/mutations'

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'
const wrongName = 'te'
const wrongEmail = 'wrong'
const wrongPassword = 'te'

afterAll(async () => {
  await client.$disconnect()
  await redis.quit()
})

describe('Register user', () => {
  test('Check registration', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: registerMutation,
      variables: {
        data: {
          email: userEmail,
          name: userName,
          password: userPassword,
        },
      },
    })

    expect(res.data.registerUser).toBe(true)
  })

  test('Check bad email registration', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: registerMutation,
      variables: {
        data: {
          email: wrongEmail,
          name: userName,
          password: userPassword,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot create account with provided credentials'
    )

    expect(res.errors![0].extensions).toBeDefined()
    expect(res.errors![0].extensions![0]).toBeDefined()

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'email',
      message: 'email must be a valid email',
    })
  })

  test('Check bad name registration', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: registerMutation,
      variables: {
        data: {
          email: userEmail,
          name: wrongName,
          password: userPassword,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot create account with provided credentials'
    )

    expect(res.errors![0].extensions).toBeDefined()
    expect(res.errors![0].extensions![0]).toBeDefined()

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'name',
      message: 'name must be at least 3 characters',
    })
  })

  test('Check bad password registration', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 0, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: registerMutation,
      variables: {
        data: {
          email: userEmail,
          name: userName,
          password: wrongPassword,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot create account with provided credentials'
    )

    expect(res.errors![0].extensions).toBeDefined()
    expect(res.errors![0].extensions![0]).toBeDefined()

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'password',
      message: 'password must be at least 3 characters',
    })
  })
})
