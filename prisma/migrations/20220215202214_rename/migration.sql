/*
  Warnings:

  - You are about to drop the `UsersInConversations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsersInConversations" DROP CONSTRAINT "UsersInConversations_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "UsersInConversations" DROP CONSTRAINT "UsersInConversations_userId_fkey";

-- DropTable
DROP TABLE "UsersInConversations";

-- CreateTable
CREATE TABLE "ConversationUser" (
    "conversationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ConversationUser_pkey" PRIMARY KEY ("userId","conversationId")
);

-- AddForeignKey
ALTER TABLE "ConversationUser" ADD CONSTRAINT "ConversationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationUser" ADD CONSTRAINT "ConversationUser_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
