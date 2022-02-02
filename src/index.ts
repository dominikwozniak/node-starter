import dotenv from 'dotenv-safe'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import * as http from 'http'
import { context } from './context'
import { schema } from '@src/utils/generateSchema'
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';

dotenv.config()

async function bootstrap() {

  const app = express();
  const httpServer = http.createServer(app)

  const server = new ApolloServer({
    schema,
    context: context,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () => {
    console.log('App is listening on http://localhost:4000');
  });

}

bootstrap()
  .catch((err) => {
    console.error(err)
  });
