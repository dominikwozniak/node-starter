import { Context } from '@src/context'
import { ApolloError } from 'apollo-server-core'
import { ResolverMap } from '@src/utils/graphql-types'
import { applyMiddleware } from '@src/middleware/applyMiddleware'
import { authorization } from '@src/middleware/authorization.middleware'

const resolvers: ResolverMap = {
  Query: {
    whoAmI: applyMiddleware(
      authorization,
      async (_parent, _args, context: Context) => {
        const user = await context.prisma.user.findUnique({
          // @ts-ignore
          where: { id: context.userId },
        })

        if (!user) {
          throw new ApolloError('Invalid user')
        }

        return user
      }
    ),
  },
}

export default resolvers
