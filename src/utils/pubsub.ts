import { RedisPubSub } from 'graphql-redis-subscriptions'
import { PubSub } from 'graphql-subscriptions'

export const pubsub =
  process.env.NODE_ENV === 'production' ? new RedisPubSub() : new PubSub()
