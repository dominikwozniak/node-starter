import { Context } from '@src/context'
import { sessionCookieId } from '@src/constants/session.const'

export default {
  Mutation: {
    logoutUser: async (_parent: unknown, _args: unknown, context: Context) => {
      return new Promise((res, rej) =>
        // @ts-ignore
        context.req.session!.destroy((err) => {
          if (err) {
            console.error(err)
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
