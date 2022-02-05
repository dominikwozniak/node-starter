import { nanoid } from 'nanoid'
import { createConfirmUserUrl, sendEmail } from '@src/utils/mail'
import { generateConfirmToken } from '@src/utils/generate/generate-confirm-token'

export const confirmUserMail = async (email: string) => {
  const token = nanoid(32)
  const url = createConfirmUserUrl(token)
  await sendEmail(email, url, 'Confirm account')

  return generateConfirmToken(token)
}
