import { PrismaClient } from '@prisma/client'

export const prismaClient = new PrismaClient()

export const githubUser = async (profile: any) => {
  const { id: githubId, displayName } = profile

  const user = await prismaClient.user.upsert({
    where: {
      // @ts-ignore
      githubId,
    },
    update: {},
    create: {
      githubId,
      name: displayName,
      confirmed: true,
      oauth: true
    },
  })

  return user.id
}
