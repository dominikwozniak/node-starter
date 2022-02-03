import * as yup from 'yup'
import argon2 from 'argon2'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/formatYupError'
import { sessionUserId } from '@src/constants/session.const'
import { ApolloError } from 'apollo-server-core'

export default {
  Query: {
    whoAmI: async (_parent: unknown, _args: unknown, context: Context) => {
      if (!context.userId) {
        throw new ApolloError('Invalid user')
      }

      // @ts-ignore
      const user = await context.prisma.user.findUnique({
        where: { id: context.userId },
      })

      if (!user) {
        throw new ApolloError('Invalid user')
      }

      return user
    },
  },
}
