import { nanoid } from 'nanoid'
import { createForgotPasswordUrl, sendEmail } from '@src/utils/mail'
import { generateForgotToken } from '@src/utils/generate/generate-forgot-token'

export const forgotPasswordMail = async (email: string) => {
  const token = nanoid(32)
  const url = createForgotPasswordUrl(token)
  await sendEmail(email, url, 'Forgot password')

  return generateForgotToken(token)
}
