import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { loginMutation, updateUser } from '@src/__tests__/utils/mutations';

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'
const updatedEmail = 'updated@mail.com'
const updatedName = 'Updated'
const invalidEmail = 'te'
const invalidName = 'te'

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

describe('Update user', () => {
  test('Check email update', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateUser,
      variables: {
        data: {
          email: updatedEmail,
        },
      },
    })

    expect(res.data.updateUser).toBeTruthy()
  })

  test('Check name update', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateUser,
      variables: {
        data: {
          name: updatedName
        },
      },
    })

    expect(res.data.updateUser).toBeTruthy()
  })

  test('Check invalid email update', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateUser,
      variables: {
        data: {
          email: invalidEmail,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot update profile with provided data'
    )

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'email',
      message: 'email must be a valid email',
    })
  })

  test('Check invalid name update', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: updateUser,
      variables: {
        data: {
          name: invalidName,
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot update profile with provided data'
    )

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'name',
      message: 'name must be at least 3 characters',
    })
  })
})
