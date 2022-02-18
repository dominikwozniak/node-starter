import { Context } from '@src/context'
import { ApolloError } from 'apollo-server-core'

export const checkUserInConversation = async (
  context: Context,
  conversationId: number,
  message: string
) => {
  const conversationWithUser = await context.prisma.conversationUser.findMany({
    where: {
      // @ts-ignore
      userId: parseInt(context.userId),
      conversationId,
    },
  })

  if (!conversationWithUser.length) {
    throw new ApolloError(message)
  }
}
