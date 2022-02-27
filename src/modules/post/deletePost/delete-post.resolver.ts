import * as yup from 'yup'
import omit from 'lodash/omit'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { DeletePostInput } from '@src/modules/post/deletePost/delete-post.input'

const deletePostSchema = yup.object().shape({
  postId: yup.number().min(0),
})

const resolvers: ResolverMap = {
  Mutation: {
    deletePost: applyMiddleware(
      authorization,
      async (_parent, args: { data: DeletePostInput }, context: Context) => {
        const { postId } = args.data

        try {
          await deletePostSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot delete post with provided data',
            formatYupError(error)
          )
        }
        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        const postWithUser = await context.prisma.post.findFirst({
          where: {
            id: postId,
            userId: parseInt(context.userId),
          },
        })

        if (!postWithUser) {
          throw new ApolloError('Cannot update post')
        }

        try {
          await context.prisma.post.delete({
            where: {
              id: postId,
            }
          })
        } catch (error) {
          throw new ApolloError('Cannot delete post')
        }

        return true
      }
    ),
  },
}

export default resolvers
