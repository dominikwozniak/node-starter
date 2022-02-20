import dotenv from 'dotenv-safe'
import express from 'express'
import morgan from 'morgan'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import * as http from 'http'
import { ApolloServer } from 'apollo-server-express'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core'
import log from '@src/utils/logger'
import { schema } from '@src/utils/generate/generate-schema'
import { context } from '@src/context'
import { githubStrategy } from '@src/utils/passport/github-strategy'
import { sessionMiddleware } from '@src/utils/session'
import { subscriptionServerConfig } from '@src/utils/apollo/subscriptionServer.config'

dotenv.config()

async function bootstrap() {
  const app = express()
  const httpServer = http.createServer(app)

  passport.use(githubStrategy)

  app.use(cookieParser())
  app.use(cors())
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combine' : 'dev'))
  app.use(sessionMiddleware)

  app.use(passport.initialize())
  app.get('/auth/github', passport.authenticate('github', { session: false }))
  app.get(
    '/auth/github/callback',
    passport.authenticate('github', { session: false }),
    async (req, res) => {
      ;(req.session as any).userId = (req.user as any).id
      // TODO: frontend redirect
      res.redirect('/graphql')
    }
  )

  const subscriptionServer = SubscriptionServer.create(
    subscriptionServerConfig,
    { server: httpServer, path: '/graphql' }
  )

  const server = new ApolloServer({
    schema,
    context,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close()
            },
          }
        },
      },
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  })

  await server.start()
  server.applyMiddleware({ app })

  httpServer.listen(4000, () =>
    log.info(`Server is now running on http://localhost:4000/graphql`)
  )
}

bootstrap().catch((err) => {
  log.error(err)
})
