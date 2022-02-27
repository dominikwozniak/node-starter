import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'

const resolvers: ResolverMap = {
  Query: {
    getUserPosts: applyMiddleware(
      authorization,
      async (_parent, _args, context: Context) => {
        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        try {
          return await context.prisma.post.findMany({
            where: {
              userId: parseInt(context.userId),
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              comments: true
            }
          })
        } catch (error) {
          throw new ApolloError('Cannot get posts')
        }
      }
    ),
  },
}

export default resolvers
