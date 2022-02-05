import { GraphQLMiddlewareFunc, Resolver } from '@src/utils/graphql-types'

// TODO: make sure how to implement 2 or more middlewares
export const applyMiddleware =
  (middlewareFunc: GraphQLMiddlewareFunc, resolverFunc: Resolver) =>
  (parent: any, args: any, context: any, info: any) =>
    middlewareFunc(resolverFunc, parent, args, context, info)
