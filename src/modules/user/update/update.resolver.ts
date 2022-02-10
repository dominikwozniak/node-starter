import * as yup from 'yup'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/format-yup-error'
import { ResolverMap } from '@src/utils/graphql-types'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { authorization } from '@src/middleware/authorization.middleware'
import { UpdateUserInput } from '@src/modules/user/update/update-user.input'
import log from '@src/utils/logger'

const updateUser = yup.object().shape({
  email: yup.string().email(),
  name: yup.string().min(3).max(255),
})

const resolvers: ResolverMap = {
  Mutation: {
    updateUser: applyMiddleware(
      authorization,
      async (_parent, args: { data: UpdateUserInput }, context: Context) => {
        try {
          await updateUser.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot update profile with provided data',
            formatYupError(error)
          )
        }

        try {
          await context.prisma.user.update({
            where: {
              // @ts-ignore
              id: context.userId,
            },
            data: {
              ...args.data,
            },
          })
        } catch (error) {
          log.error(error)
          return false
        }

        return true
      }
    ),
  },
}

export default resolvers
