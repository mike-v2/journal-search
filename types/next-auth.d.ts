import { User as DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string,
    name: string,
    email: string,
    image: string,
    emailVerified: Date,
  }

  interface Session extends DefaultSession {
    id: string,
    user: User,
    userId: string,
    expires: Date,
    sessionToken: string,
  }
}