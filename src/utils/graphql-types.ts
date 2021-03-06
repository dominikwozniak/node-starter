import { Context } from '@src/context'

export type Resolver = (
  parent: any,
  args: any,
  context: Context,
  info: any
) => any

export type GraphQLMiddlewareFunc = (
  resolver: Resolver,
  parent: any,
  args: any,
  context: Context,
  info: any
) => any

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver | { [key: string]: Resolver }
  }
}
