import * as yup from 'yup'
import omit from 'lodash/omit'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { UpdatePostInput } from '@src/modules/post/updatePost/update-post.input'
import { formatYupError } from '@src/utils/format-yup-error'

const updatePostSchema = yup.object().shape({
  postId: yup.number().min(0),
  title: yup.string(),
  content: yup.string(),
})

const resolvers: ResolverMap = {
  Mutation: {
    updatePost: applyMiddleware(
      authorization,
      async (_parent, args: { data: UpdatePostInput }, context: Context) => {
        const { postId } = args.data

        try {
          await updatePostSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot update post with provided data',
            formatYupError(error)
          )
        }
        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        const postWithUser = await context.prisma.post.findFirst({
          where: {
            id: postId,
            userId: parseInt(context.userId)
          }
        })

        if (!postWithUser) {
          throw new ApolloError('Cannot update post')
        }

        try {
          await context.prisma.post.update({
            where: {
              id: postId
            },
            data: {
              ...omit(args.data, ['postId'])
            }
          })
        } catch (error) {
          throw new ApolloError('Cannot get posts')
        }

        return true
      }
    ),
  },
}

export default resolvers
