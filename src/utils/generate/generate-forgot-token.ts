import { forgotPasswordPrefix } from '@src/constants/redis-prefixes.const'

export const generateForgotToken = (providedToken = '') => {
  return forgotPasswordPrefix + providedToken
}
