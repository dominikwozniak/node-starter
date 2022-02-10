import Redis from 'ioredis'
import argon2 from 'argon2'
import { createTestClient } from 'apollo-server-testing'
import { PrismaClient } from '@prisma/client'
import { constructTestServer } from '@src/__tests__/utils/server'
import { changePasswordMutation, loginMutation, updateUserMutation } from '@src/__tests__/utils/mutations';

const client = new PrismaClient()
const redis = new Redis()

const userName = 'test'
const userEmail = 'test@mail.com'
const userPassword = 'Test123'

const wrongPassword = 'Test321'
const newPassword = 'Test321'
const invalidPassword = 'te'

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

describe('Change password user', () => {
  test('Check wrong old password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: changePasswordMutation,
      variables: {
        data: {
          oldPassword: wrongPassword,
          newPassword: newPassword
        },
      },
    })

    expect(res.data.updateUser).toBeFalsy()
  })

  test('Check invalid old password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: changePasswordMutation,
      variables: {
        data: {
          oldPassword: invalidPassword,
          newPassword
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot change password with provided credentials'
    )

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'oldPassword',
      message: 'oldPassword must be at least 3 characters',
    })
  })

  test('Check invalid new password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: changePasswordMutation,
      variables: {
        data: {
          oldPassword: userPassword,
          newPassword: invalidPassword
        },
      },
    })

    expect(res.data).toBe(null)

    expect(res.errors![0]).toBeDefined()
    expect(res.errors![0].message).toBe(
      'Cannot change password with provided credentials'
    )

    expect(res.errors![0].extensions![0]).toStrictEqual({
      path: 'newPassword',
      message: 'newPassword must be at least 3 characters',
    })
  })

  test('Check change password', async () => {
    const { server } = constructTestServer({ prisma: client, userId: 1, redis })
    // @ts-ignore
    const { mutate } = createTestClient(server)
    const res = await mutate({
      mutation: changePasswordMutation,
      variables: {
        data: {
          oldPassword: userPassword,
          newPassword
        },
      },
    })

    expect(res.data.changePassword).toBeTruthy()
  })
})
