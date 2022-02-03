import { Context } from '@src/context'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    whoAmI: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) {
        throw new ApolloError('Invalid user')
      }

      const user = await context.prisma.user.findUnique({
        // @ts-ignore
        where: { id: context.userId },
      })

      if (!user) {
        throw new ApolloError('Invalid user')
      }

      return user
    },
  },
}
