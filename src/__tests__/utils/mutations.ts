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
