import { Strategy as GitHubStrategy } from 'passport-github2'
import { githubUser } from '@src/utils/prisma'

export const githubStrategy = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_OAUTH_CLIENT_ID!,
    clientSecret: process.env.GITHUB_OAUTH_SECRET!,
    callbackURL: 'http://localhost:4000/auth/github/callback',
  },
  async (_: any, __: any, profile: any, cb: any) => {
    const userId = await githubUser(profile)
    return cb(null, { id: userId })
  }
)
