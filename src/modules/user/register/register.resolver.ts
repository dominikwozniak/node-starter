import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { RegisterUserInput } from '@src/modules/user/register/register-user.input'
import { formatYupError } from '@src/utils/format-yup-error'
import { confirmUserMail } from '@src/utils/mail/confirm-user-mail'
import { ResolverMap } from '@src/utils/graphql-types'

const registerUserSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  name: yup.string().min(3).max(255),
  password: yup.string().min(3).max(255),
})

const resolvers: ResolverMap = {
  Mutation: {
    registerUser: async (
      _parent,
      args: { data: RegisterUserInput },
      context: Context
    ) => {
      const { email, name, password } = args.data

      try {
        await registerUserSchema.validate(args.data, { abortEarly: false })
      } catch (error) {
        throw new UserInputError(
          'Cannot create account with provided credentials',
          formatYupError(error)
        )
      }

      const found = await context.prisma.user.findFirst({
        where: { email },
      })

      if (found) {
        throw new UserInputError(
          'Cannot create account with provided credentials'
        )
      }

      const hashedPassword = await argon2.hash(password)

      const user = await context.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      // TODO: check if user have email
      const confirmToken = await confirmUserMail(user.email!)
      await context.redis.set(confirmToken, email, 'ex', 60 * 60 * 24)

      return !!user
    },
  },
}

export default resolvers
