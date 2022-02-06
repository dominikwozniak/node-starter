import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { ApolloError } from 'apollo-server-core'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/format-yup-error'
import { LoginUserInput } from '@src/modules/user/login/login-user.input'
import { sessionUserId } from '@src/constants/session.const'
import { ResolverMap } from '@src/utils/graphql-types'

const loginUserSchema = yup.object().shape({
  email: yup.string().min(3).max(255).email(),
  password: yup.string().min(3).max(255),
})

const resolvers: ResolverMap = {
  Mutation: {
    loginUser: async (
      _parent,
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

      // TODO: check if user have password
      const validatePassword = await argon2.verify(user.password!, password)

      if (!validatePassword) {
        throw new UserInputError('Invalid email or password')
      }

      if (!user.confirmed) {
        throw new ApolloError('User is not active')
      }

      // @ts-ignore
      context.req.session[sessionUserId] = user.id

      return user
    },
  },
}

export default resolvers
