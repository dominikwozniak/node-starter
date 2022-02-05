import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/formatYupError'
import { ResolverMap } from '@src/utils/graphql-types'
import { generateForgotToken } from '@src/utils/generate/generate-forgot-token'
import { ChangePasswordInput } from '@src/modules/user/changePassword/change-password.input'
import { applyMiddleware } from '@src/middleware/applyMiddleware'
import { authorization } from '@src/middleware/authorization.middleware'
import { ApolloError } from 'apollo-server-core'
import { getSessionUser } from '@src/utils/user/getSessionUser'

const changePasswordSchema = yup.object().shape({
  oldPassword: yup.string().min(3).max(255),
  newPassword: yup.string().min(3).max(255),
})

const resolvers: ResolverMap = {
  Mutation: {
    changePassword: applyMiddleware(
      authorization,
      async (
        _parent,
        args: { data: ChangePasswordInput },
        context: Context
      ) => {
        const { oldPassword, newPassword } = args.data

        try {
          await changePasswordSchema.validate(args.data, {
            abortEarly: false,
          })
        } catch (error) {
          throw new UserInputError(
            'Cannot change password with provided credentials',
            formatYupError(error)
          )
        }

        const user = await getSessionUser(context)
        const validatePassword = await argon2.verify(user.password, oldPassword)

        if (!validatePassword) {
          return false
        }

        const hashedPassword = await argon2.hash(newPassword)

        await context.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: hashedPassword,
          },
        })

        return true
      }
    ),
  },
}

export default resolvers
