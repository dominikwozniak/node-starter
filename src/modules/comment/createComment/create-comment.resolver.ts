import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { CreateCommentInput } from '@src/modules/comment/createComment/create-comment.input'

const createCommentSchema = yup.object().shape({
  postId: yup.number(),
  text: yup.string().min(1),
})

const resolvers: ResolverMap = {
  Mutation: {
    createComment: applyMiddleware(
      authorization,
      async (_parent, args: { data: CreateCommentInput }, context: Context) => {
        const { postId, text } = args.data

        try {
          await createCommentSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot create comment with provided data',
            formatYupError(error)
          )
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        try {
          return await context.prisma.comment.create({
            data: {
              text,
              user: {
                connect: {
                  id: parseInt(context.userId),
                },
              },
              post: {
                connect: {
                  id: postId,
                },
              },
            },
            include: {
              user: true,
              post: true,
            },
          })
        } catch (error) {
          throw new ApolloError('Cannot create post')
        }
      }
    ),
  },
}

export default resolvers
