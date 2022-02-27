import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { CreatePostInput } from '@src/modules/post/createPost/create-post.input'

const createPostSchema = yup.object().shape({
  title: yup.string(),
  content: yup.string(),
})

const resolvers: ResolverMap = {
  Mutation: {
    createPost: applyMiddleware(
      authorization,
      async (_parent, args: { data: CreatePostInput }, context: Context) => {
        const { title, content } = args.data

        try {
          await createPostSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot create post with provided data',
            formatYupError(error)
          )
        }

        if (!context.userId) {
          throw new ApolloError('Authorization failed')
        }

        try {
          return await context.prisma.post.create({
            data: {
              title,
              content,
              user: {
                connect: {
                  id: parseInt(context.userId),
                },
              },
            },
            // TODO: include user
          })
        } catch (error) {
          throw new ApolloError('Cannot create post')
        }
      }
    ),
  },
}

export default resolvers
