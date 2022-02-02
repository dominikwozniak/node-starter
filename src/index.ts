import dotenv from 'dotenv-safe'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import * as http from 'http'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import session from 'express-session'
import { schema } from '@src/utils/generateSchema'
import { context } from '@src/context'
import { sessionCookieId } from '@src/constants/session.const'

dotenv.config()

async function bootstrap() {
  const app = express()
  const httpServer = http.createServer(app)

  app.use(cookieParser())
  app.use(cors())
  app.use(
    session({
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
    console.log('App is listening on http://localhost:4000/graphql')
  })
}

bootstrap().catch((err) => {
  console.error(err)
})
