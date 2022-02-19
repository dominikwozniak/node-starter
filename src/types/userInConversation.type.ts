import { prismaClient } from '@src/utils/prisma'

// @ObjectType()
// export class UsersInConversations {
//   @Field((_type) => String, {
//     nullable: false,
//   })
//   conversationId!: string;
//
//   @Field((_type) => User)
//   user: User;
//
//   @Field((_type) => String, {
//     nullable: false,
//   })
//   userId!: string;
// }

export type UsersInConversation = ReturnType<
  typeof prismaClient.usersInConversations.findUnique
>
