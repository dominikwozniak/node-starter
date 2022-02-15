import { prismaClient } from '@src/utils/prisma'

export type UsersInConversation = ReturnType<
  typeof prismaClient.conversation.findUnique
>
