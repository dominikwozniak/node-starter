import session from 'express-session'
import connectRedis from 'connect-redis'
import { redis } from '@src/utils/redis'
import { sessionCookieId } from '@src/constants/session.const'

const RedisStore = connectRedis(session)

export const sessionMiddleware = session({
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
