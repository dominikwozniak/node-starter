import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { RegisterUserInput } from '@src/modules/user/register/register-user.input'
import { formatYupError } from '@src/utils/formatYupError'

const registerUserSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  name: yup.string().min(3).max(255),
  password: yup.string().min(3).max(255),
})

export default {
  // todo: remove query
  Query: {
    allUsers: (_parent: unknown, _args: unknown, context: Context) => {
      return context.prisma.user.findMany()
    },
  },
  Mutation: {
    registerUser: async (
      _parent: unknown,
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

      return !!user
    },
  },
}
