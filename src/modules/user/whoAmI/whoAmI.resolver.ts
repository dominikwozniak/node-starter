import { ResolverMap } from '@src/utils/graphql-types'
import { applyMiddleware } from '@src/middleware/apply-middleware'
import { authorization } from '@src/middleware/authorization.middleware'
import { getSessionUser } from '@src/utils/user/get-session-user'

const resolvers: ResolverMap = {
  Query: {
    whoAmI: applyMiddleware(
      authorization,
      async (_parent, _args, context) => {
        return getSessionUser(context)
      }
    ),
  },
}

export default resolvers
