import { schema } from '@src/utils/generate/generate-schema'
import { execute, subscribe } from 'graphql'
import { sessionMiddleware } from '@src/utils/session'
import { userLoader as uLoader } from '@src/loaders/userLoader'

export const subscriptionServerConfig = {
  schema,
  execute,
  subscribe,
  onConnect: async (
    _connectionParams: any,
    _webSocket: any,
    { request }: any
  ) => {
    const req = await new Promise((resolve) => {
      // @ts-ignore
      sessionMiddleware(request as Request, {} as Response, () => {
        resolve(request)
      })
    })

    return { req, userLoader: uLoader() }
  },
}
