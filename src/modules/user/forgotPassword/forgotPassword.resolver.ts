import * as yup from 'yup'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/format-yup-error'
import { ResolverMap } from '@src/utils/graphql-types'
import { ForgotPasswordInput } from '@src/modules/user/forgotPassword/forgot-password.input'
import { forgotPasswordMail } from '@src/utils/mail/forgot-password-mail'

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
})

const resolvers: ResolverMap = {
  Mutation: {
    forgotPassword: async (
      _parent,
      args: { data: ForgotPasswordInput },
      context: Context
    ) => {
      const { email } = args.data

      try {
        await forgotPasswordSchema.validate(args.data, { abortEarly: false })
      } catch (error) {
        throw new UserInputError(
          'Cannot reset password with provided email',
          formatYupError(error)
        )
      }

      const user = await context.prisma.user.findUnique({ where: { email } })

      if (!user) {
        return false
      }

      const confirmToken = await forgotPasswordMail(email)
      await context.redis.set(confirmToken, email, 'ex', 60 * 60 * 24)

      return true
    },
  },
}

export default resolvers
