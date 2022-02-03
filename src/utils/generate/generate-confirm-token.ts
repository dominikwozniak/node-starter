import { confirmUserPrefix } from '@src/constants/redis-prefixes.const'

export const generateConfirmToken = (providedToken = '') => {
  return confirmUserPrefix + providedToken
}
