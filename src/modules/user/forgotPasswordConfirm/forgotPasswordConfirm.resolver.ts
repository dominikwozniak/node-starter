import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/format-yup-error'
import { ResolverMap } from '@src/utils/graphql-types'
import { ForgotPasswordConfirmInput } from '@src/modules/user/forgotPasswordConfirm/forgot-password-confirm.input'
import { generateForgotToken } from '@src/utils/generate/generate-forgot-token'

const forgotPasswordConfirmSchema = yup.object().shape({
  password: yup.string().min(3).max(255),
  token: yup.string().min(3),
})

const resolvers: ResolverMap = {
  Mutation: {
    forgotPasswordConfirm: async (
      _parent,
      args: { data: ForgotPasswordConfirmInput },
      context: Context
    ) => {
      const { token, password } = args.data

      try {
        await forgotPasswordConfirmSchema.validate(args.data, {
          abortEarly: false,
        })
      } catch (error) {
        throw new UserInputError(
          'Cannot reset password with provided data',
          formatYupError(error)
        )
      }

      const forgotToken = generateForgotToken(token)
      const userEmail = await context.redis.get(forgotToken)

      if (!userEmail) {
        return false
      }

      try {
        const hashedPassword = await argon2.hash(password)
        await context.prisma.user.update({
          where: { email: userEmail },
          data: {
            password: hashedPassword,
          },
        })
      } catch (error) {
        return false
      }

      await context.redis.del(forgotToken)

      return true
    },
  },
}

export default resolvers
