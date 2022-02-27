import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { GetPostsByUserIdInput } from '@src/modules/post/getPostsByUserId/get-posts-by-user-id.input'

const getPostsByIdSchema = yup.object().shape({
  id: yup.number(),
})

const resolvers: ResolverMap = {
  Query: {
    getPostsByUserId: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: GetPostsByUserIdInput },
        context: Context
      ) => {
        const { userId } = args.data

        try {
          await getPostsByIdSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot get posts for provided user',
            formatYupError(error)
          )
        }

        try {
          return await context.prisma.post.findMany({
            where: {
              userId,
            },
          })
        } catch (error) {
          throw new ApolloError('Cannot get posts')
        }
      }
    ),
  },
}

export default resolvers
