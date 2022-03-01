import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { GetCommentsByPostIdInput } from '@src/modules/comment/getCommentsByPostId/get-comments-by-post-id.input'

const getCommentsByPostIdSchema = yup.object().shape({
  postId: yup.number(),
})

const resolvers: ResolverMap = {
  Query: {
    getCommentsByPostId: applyMiddleware(
      authorization,
      async (_parent, args: { data: GetCommentsByPostIdInput }, context: Context) => {
        const { postId } = args.data

        try {
          await getCommentsByPostIdSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot get comments with provided post id',
            formatYupError(error)
          )
        }

        try {
          return await context.prisma.comment.findMany({
            where: {
              postId
            },
            include: {
              user: true
            }
          })
        } catch (error) {
          throw new ApolloError('Cannot get post')
        }
      }
    ),
  },
}

export default resolvers
