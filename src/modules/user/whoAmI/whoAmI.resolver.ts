import { Context } from '@src/context'
import { ApolloError } from 'apollo-server-core'
import { ResolverMap } from '@src/utils/graphql-types'

const resolvers: ResolverMap = {
  Query: {
    whoAmI: async (_parent, _args, context: Context) => {
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

export default resolvers
