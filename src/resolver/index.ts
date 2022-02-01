import { merge } from 'lodash'
import { userResolver } from '@src/resolver/user.resolver'
import { DateTimeResolver } from 'graphql-scalars'

export const resolvers = merge(
  {
    DateTime: DateTimeResolver,
  },
  userResolver
)
