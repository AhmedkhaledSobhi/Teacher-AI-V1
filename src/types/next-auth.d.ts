import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    session?: {
      access_token?: string
    }
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      // Add any other user properties your API returns
      [key: string]: any
    }
  }

  interface User {
    accessToken?: string
    // Add any other user properties your API returns
    [key: string]: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    sessionData?: {
      access_token?: string
      [key: string]: any
    }
    userData?: {
      id: string
      name?: string | null
      email?: string | null
      // Add any other user properties your API returns
      [key: string]: any
    }
  }
}