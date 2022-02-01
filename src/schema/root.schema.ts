import { gql } from 'apollo-server'

export const rootSchema = gql`
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }

  type Error {
    path: String
    message: String
  }

  scalar DateTime
`
