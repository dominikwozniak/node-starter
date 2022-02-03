import * as yup from 'yup'
import { UserInputError } from 'apollo-server'
import { Context } from '@src/context'
import { formatYupError } from '@src/utils/formatYupError'
import { ConfirmUserInput } from '@src/modules/user/confirm/confirm-user.input'
import { generateConfirmToken } from '@src/utils/generate/generate-confirm-token';

const confirmUserSchema = yup.object().shape({
  token: yup.string().min(3).max(255),
})

export default {
  Mutation: {
    confirmUser: async (
      _parent: unknown,
      args: { data: ConfirmUserInput },
      context: Context
    ) => {
      const { token } = args.data

      try {
        await confirmUserSchema.validate(args.data, { abortEarly: false })
      } catch (error) {
        throw new UserInputError(
          'Cannot confirm user with provided token',
          formatYupError(error)
        )
      }

      const confirmToken = generateConfirmToken(token);
      const userEmail = await context.redis.get(confirmToken);

      if (!userEmail) {
        return false;
      }

      try {
        await context.prisma.user.update({
          where: { email: userEmail },
          data: {
            confirmed: true
          }
        })
      } catch (error) {
        return false
      }

      await context.redis.del(confirmToken);

      return true
    },
  },
}
