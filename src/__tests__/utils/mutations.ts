import { gql } from 'apollo-server-core'

export const registerMutation = `
    mutation RegisterUser($data: RegisterUserInput) {
        registerUser (data: $data)
    }
`
