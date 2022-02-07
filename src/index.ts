import dotenv from 'dotenv-safe'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import * as http from 'http'
import morgan from 'morgan'
import passport from 'passport'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core'
import connectRedis from 'connect-redis'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import session from 'express-session'
import { schema } from '@src/utils/generate/generate-schema'
import { context } from '@src/context'
import { sessionCookieId } from '@src/constants/session.const'
import { redis } from '@src/utils/redis'
import log from '@src/utils/logger'
import { githubStrategy } from '@src/utils/passport/github-strategy';

dotenv.config()

async function bootstrap() {
  const app = express()
  const httpServer = http.createServer(app)
  const RedisStore = connectRedis(session)

  passport.use(githubStrategy)

  app.use(cookieParser())
  app.use(cors())
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combine' : 'dev'))
  app.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: sessionCookieId,
      secret: process.env.SESSION_SECRET || '',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  )

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

  const server = new ApolloServer({
    schema,
    context,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  })

  await server.start()
  server.applyMiddleware({ app })

  app.listen({ port: 4000 }, () => {
    log.info('App is listening on http://localhost:4000/graphql')
  })
}

bootstrap().catch((err) => {
  log.error(err)
})
