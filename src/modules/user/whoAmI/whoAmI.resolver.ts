import { Context } from '@src/context'
import { ApolloError } from 'apollo-server-core'
import { ResolverMap } from '@src/utils/graphql-types'
import { applyMiddleware } from '@src/middleware/applyMiddleware'
import { authorization } from '@src/middleware/authorization.middleware'
import { getSessionUser } from '@src/utils/user/getSessionUser'

const resolvers: ResolverMap = {
  Query: {
    whoAmI: applyMiddleware(
      authorization,
      async (_parent, _args, context: Context) => {
        return getSessionUser(context)
      }
    ),
  },
}

export default resolvers
