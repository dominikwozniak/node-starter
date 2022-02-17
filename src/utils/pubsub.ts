import { RedisPubSub } from 'graphql-redis-subscriptions'
import { PubSub } from 'graphql-subscriptions'

// TODO: production redis pubsub
export const pubsub = process.env.NODE_ENV === 'production' ? new RedisPubSub() : new PubSub()
