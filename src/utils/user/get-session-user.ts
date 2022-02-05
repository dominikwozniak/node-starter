import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'

export const getSessionUser = async (context: Context) => {
  const user = await context.prisma.user.findUnique({
    // @ts-ignore
    where: { id: context.userId },
  })

  if (!user) {
    throw new ApolloError('Invalid user')
  }

  return user
}
