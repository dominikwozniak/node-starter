import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/formatYupError'
import { LoginUserInput } from '@src/modules/user/login/login-user.input'
import { sessionUserId } from '@src/constants/session.const'

const loginUserSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  password: yup.string().min(3).max(255),
})

export default {
  Mutation: {
    loginUser: async (
      _parent: unknown,
      args: { data: LoginUserInput },
      context: Context
    ) => {
      const { email, password } = args.data

      try {
        await loginUserSchema.validate(args.data, { abortEarly: false })
      } catch (error) {
        throw new UserInputError(
          'Cannot login with provided credentials',
          formatYupError(error)
        )
      }

      const user = await context.prisma.user.findFirst({
        where: { email: email },
      })

      if (!user) {
        throw new UserInputError('Invalid email or password')
      }

      const validatePassword = await argon2.verify(user.password, password)

      if (!validatePassword) {
        throw new UserInputError('Invalid email or password')
      }

      // @ts-ignore
      context.req.session[sessionUserId] = user.id

      return user
    },
  },
}
