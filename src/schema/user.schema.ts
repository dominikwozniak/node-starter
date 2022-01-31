import { gql } from 'apollo-server';

export const userSchema = gql`
  type User {
    id: Int!
    email: String
    name: String
    confirmed: Boolean
    password: String
  }

  extend type Query {
    allUsers: [User!]!
  }
  
  extend type Mutation {
    registerUser(data: RegisterUserInput): User!
  }

  input RegisterUserInput {
    email: String!
    name: String!
    password: String!
  }
`;
