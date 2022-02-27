import * as yup from 'yup'
import { ApolloError } from 'apollo-server-core'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { ResolverMap } from '@src/utils/graphql-types'
import { authorization } from '@src/middleware/authorization.middleware'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { formatYupError } from '@src/utils/format-yup-error'
import { GetPostByIdInput } from '@src/modules/post/getPostById/get-post-by-id.input'

const getPostByIdSchema = yup.object().shape({
  id: yup.number(),
})

const resolvers: ResolverMap = {
  Query: {
    getPostById: applyMiddleware(
      authorization,
      async (_parent, args: { data: GetPostByIdInput }, context: Context) => {
        const { id } = args.data

        try {
          await getPostByIdSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot get post with provided id',
            formatYupError(error)
          )
        }

        try {
          return await context.prisma.post.findFirst({
            where: {
              id,
            },
          })
        } catch (error) {
          throw new ApolloError('Cannot get post')
        }
      }
    ),
  },
}

export default resolvers
