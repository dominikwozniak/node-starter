import { gql } from 'apollo-server-core'

export const whoAmI = gql`
  query whoAmI {
    whoAmI {
      id
      email
      name
    }
  }
`
