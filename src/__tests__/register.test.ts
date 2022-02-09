import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { registerMutation } from '@src/__tests__/utils/mutations'
import Redis from 'ioredis'

const client = new PrismaClient()
const redis = new Redis()

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
          email: 'test@mail.com',
          name: 'Test',
          password: 'Test@123',
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
          email: 'test',
          name: 'Test',
          password: 'Test@123',
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
          email: 'test@mail.com',
          name: 'Te',
          password: 'Test@123',
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
          email: 'test@mail.com',
          name: 'Test',
          password: 'Te',
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
