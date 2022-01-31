import { Context } from '@src/context';
import { RegisterUserInput } from '@src/input/user/register-user.input';
import argon2 from 'argon2';
import { ApolloError } from 'apollo-server';

export const userResolver = {
  Query: {
    allUsers: (_parent: any, _args: any, context: Context) => {
      return context.prisma.user.findMany();
    },
  },
  Mutation: {
    registerUser: async (_parent: any, args: { data: RegisterUserInput }, context: Context) => {
      const hashedPassword = await argon2.hash(args.data.password)

      const found = await context.prisma.user.findFirst({ where: { email: args.data.email }})

      if (found) {
        throw new ApolloError('Cannot create account with provided credentials');
      }

      const user = await context.prisma.user.create({
        data: {
          name: args.data.name,
          email: args.data.email,
          password: hashedPassword,
        },
      })

      return user
    }
  },
};
