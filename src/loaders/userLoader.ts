import DataLoader from 'dataloader'
import { Prisma } from '@prisma/client'
import { prismaClient } from '@src/utils/prisma'

const user = Prisma.validator<Prisma.UserArgs>()({ include: {} })
type User = Prisma.UserGetPayload<typeof user>

type BatchUser = (ids: number[]) => Promise<User[]>

const batchUser: BatchUser = async (ids: number[]) => {
  const users = await prismaClient.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      conversations: true,
      messages: true,
    },
  })

  const userMap: { [key: number]: User } = {}
  users.forEach((u) => (userMap[u.id] = u))

  return ids.map((id) => userMap[id])
}

// @ts-ignore
export const userLoader = () => new DataLoader<number, User>(batchUser)
