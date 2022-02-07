import { Context } from '@src/context'
import { sessionCookieId } from '@src/constants/session.const'
import { ResolverMap } from '@src/utils/graphql-types'
import log from '@src/utils/logger'

const resolvers: ResolverMap = {
  Mutation: {
    logoutUser: async (_parent, _args, context: Context) => {
      return new Promise((res, rej) =>
        // @ts-ignore
        context.req.session!.destroy((err) => {
          if (err) {
            log.error(err)
            return rej(false)
          }

          // @ts-ignore
          context.res.clearCookie(sessionCookieId)
          return res(true)
        })
      )
    },
  },
}

export default resolvers
