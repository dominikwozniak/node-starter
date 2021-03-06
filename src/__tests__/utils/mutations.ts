import { gql } from 'apollo-server-core'

export const registerMutation = gql`
  mutation RegisterUser($data: RegisterUserInput) {
    registerUser(data: $data)
  }
`

export const loginMutation = gql`
  mutation LoginUser($data: LoginUserInput) {
    loginUser(data: $data) {
      id
      email
      name
    }
  }
`

export const forgotPasswordMutation = gql`
  mutation forgotPassword($data: ForgotPasswordInput) {
    forgotPassword(data: $data)
  }
`

export const forgotPasswordConfirmMutation = gql`
  mutation forgotPasswordConfirm($data: ForgotPasswordConfirmInput) {
    forgotPasswordConfirm(data: $data)
  }
`

export const confirmUserMutation = gql`
  mutation confirmUser($data: ConfirmUserInput) {
    confirmUser(data: $data)
  }
`

export const updateUserMutation = gql`
  mutation updateUser($data: UpdateUserInput) {
    updateUser(data: $data)
  }
`

export const changePasswordMutation = gql`
  mutation changePassword($data: ChangePasswordInput) {
    changePassword(data: $data)
  }
`

export const createConversationMutation = gql`
  mutation createConversation($data: CreateConversationInput) {
    createConversation(data: $data) {
      id
      name
      isPrivate
    }
  }
`

export const updateConversationMutation = gql`
  mutation updateConversation($data: UpdateConversationInput) {
    updateConversation(data: $data)
  }
`

export const joinToConversation = gql`
  mutation joinToConversation($data: JoinToConversationInput) {
    joinToConversation(data: $data)
  }
`

export const addUserToConversation = gql`
  mutation addUserToConversation($data: AddUserToConversationInput) {
    addUserToConversation(data: $data)
  }
`

export const leaveConversation = gql`
  mutation leaveConversation($data: LeaveConversationInput) {
    leaveConversation(data: $data)
  }
`

export const kickUserFromConversation = gql`
  mutation kickUserFromConversation($data: KickUserFromConversationInput) {
    kickUserFromConversation(data: $data)
  }
`

export const createMessageMutation = gql`
  mutation createMessage($data: CreateMessageInput) {
    createMessage(data: $data)
  }
`
