import { gql } from 'apollo-server';

export const rootSchema = gql`
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }

  scalar DateTime
`;
