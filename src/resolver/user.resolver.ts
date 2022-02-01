import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { RegisterUserInput } from '@src/input/user/register-user.input'
import { formatYupError } from '@src/utils/formatYupError'

const registerUserSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  name: yup.string().min(3).max(255),
  password: yup.string().min(3).max(255),
})

export const userResolver = {
  Query: {
    allUsers: (_parent: any, _args: any, context: Context) => {
      return context.prisma.user.findMany()
    },
  },
  Mutation: {
    registerUser: async (
      _parent: any,
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

      const hashedPassword = await argon2.hash(password)

      const found = await context.prisma.user.findFirst({
        where: { email },
      })

      if (found) {
        throw new UserInputError(
          'Cannot create account with provided credentials'
        )
      }

      const user = await context.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      return user
    },
  },
}
