import DataLoader from 'dataloader'
import { Prisma } from '@prisma/client'
import { prismaClient } from '@src/utils/prisma'

const conversation = Prisma.validator<Prisma.ConversationArgs>()({
  include: {
    participants: true,
    messages: true,
  },
})
type Conversation = Prisma.ConversationGetPayload<typeof conversation>

type BatchConversation = (ids: number[]) => Promise<Conversation[]>

const batchConversation: BatchConversation = async (ids: number[]) => {
  const conversations = await prismaClient.conversation.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      participants: true,
      messages: true,
    },
  })

  const conversationMap: { [key: number]: Conversation } = {}
  conversations.forEach((m) => (conversationMap[m.id] = m))

  return ids.map((id) => conversationMap[id])
}

// @ts-ignore
export const conversationLoader = () => new DataLoader<number, Conversation>(batchConversation)
