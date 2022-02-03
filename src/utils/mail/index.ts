import * as nodemailer from 'nodemailer'

export const createForgotPasswordUrl = (token: string) => {
  return `http://localhost:3000/forgot-password/${token}`
}

export const createConfirmUserUrl = (token: string) => {
  return `http://localhost:3000/confirm-account/${token}`
}

export async function sendEmail(
  email: string,
  url: string,
  subject = 'Test mail'
) {
  console.log(`Send email to ${email} and url ${url}`)

  const testAccount = await nodemailer.createTestAccount()

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  })

  const info = await transporter.sendMail({
    from: '"Test email" <foo@example.com>',
    to: email,
    subject: subject,
    text: url,
  })

  console.log(`Message sent: ${info.messageId}`)
  console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
}
