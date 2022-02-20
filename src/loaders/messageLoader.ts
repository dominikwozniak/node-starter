import DataLoader from 'dataloader'
import { Prisma } from '@prisma/client'
import { prismaClient } from '@src/utils/prisma'

const message = Prisma.validator<Prisma.ConversationMessageArgs>()({
  include: {
    conversation: true,
    author: true,
  },
})
type Message = Prisma.ConversationMessageGetPayload<typeof message>

type BatchMessage = (ids: number[]) => Promise<Message[]>

const batchMessage: BatchMessage = async (ids: number[]) => {
  const messages = await prismaClient.conversationMessage.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      conversation: true,
      author: true,
    },
  })

  const conversationMessageMap: { [key: number]: Message } = {}
  messages.forEach((m) => (conversationMessageMap[m.id] = m))

  return ids.map((id) => conversationMessageMap[id])
}

// @ts-ignore
export const messageLoader = () => new DataLoader<number, Message>(batchMessage)
