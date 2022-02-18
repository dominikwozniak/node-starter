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

export const getAllUserConversations = gql`
  query getAllUserConversations {
    getAllUserConversations {
      id
      name
    }
  }
`

export const getMessagesFromConversationQuery = gql`
  query getMessagesFromConversation($data: GetMessagesFromConversationInput) {
    getMessagesFromConversation(data: $data) {
      id
      text
      author {
        email
        name
      }
    }
  }
`

export const getMessagesPaginatedFromConversationQuery = gql`
  query getMessagesPaginatedFromConversation(
    $data: GetMessagesPaginatedFromConversationInput
  ) {
    getMessagesPaginatedFromConversation(data: $data) {
      id
      text
      author {
        email
        name
      }
    }
  }
`
