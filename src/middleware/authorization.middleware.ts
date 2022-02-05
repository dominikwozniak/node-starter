import { ApolloError } from 'apollo-server-core'
import { Resolver } from '@src/utils/graphql-types'
import { Context } from '@src/context'

export const authorization = (
  resolver: Resolver,
  root: any,
  args: any,
  context: Context,
  info: any
) => {
  if (!context.userId) {
    throw new ApolloError('Authorization failed')
  }

  return resolver(root, args, context, info)
}
