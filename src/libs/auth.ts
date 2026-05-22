// Third-party Imports
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,

  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,

  // Force the base URL to use production URL even in development
  // This ensures callback URLs point to the correct domain
  ...(process.env.NODE_ENV === "development" && {
    // In development, we want to use the production URL for callbacks
    // but keep the local API for authentication logic
    trustHost: true,
  }),

  // ** Configure one or more authentication providers
  // ** Please refer to https://next-auth.js.org/configuration/options#providers for more `providers` options
  providers: [
    CredentialProvider({
      // ** The name to display on the sign in form (e.g. 'Sign in with...')
      // ** For more details on Credentials Provider, visit https://next-auth.js.org/providers/credentials
      name: "Credentials",
      type: "credentials",

      /*
       * As we are using our own Sign-in page, we do not need to change
       * username or password attributes manually in following credentials object.
       */
      credentials: {},
      async authorize(credentials) {
        /*
         * You need to provide your own logic here that takes the credentials submitted and returns either
         * an object representing a user or value that is false/null if the credentials are invalid.
         * For e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
         * You can also use the `req` object to obtain additional parameters (i.e., the request IP address)
         */
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        try {
          // ** Login API Call to match the user credentials and receive user data in response along with his role
          const apiUrl = process.env.BACKEND_URL
            ? `${process.env.BACKEND_URL}/auth/login`
            : "https://api.drsi.ai/auth/login";

          console.log("[v0] Attempting login with API URL:", apiUrl);
          console.log("[v0] Email:", email);

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          console.log("[v0] API response status:", res.status);

          // Check if response is JSON
          const contentType = res.headers.get("content-type");
          let data: any = {};

          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const text = await res.text();
            console.error("❌ Non-JSON response:", text);
            throw new Error("Invalid response format from server");
          }

          // Handle error responses
          if (res.status === 401 || res.status === 403) {
            const errorMessage =
              data.detail ||
              data.message ||
              data.error ||
              "Invalid credentials";
            console.error("❌ Authentication failed:", errorMessage);
            throw new Error(
              JSON.stringify({ detail: errorMessage, status: res.status })
            );
          }

          // Handle other error status codes
          if (!res.ok) {
            const errorMessage =
              data.detail ||
              data.message ||
              data.error ||
              `Server error: ${res.status}`;
            console.error("❌ Server error:", errorMessage);
            throw new Error(
              JSON.stringify({ detail: errorMessage, status: res.status })
            );
          }

          // Handle successful response (200 or 201)
          if (res.status === 200 || res.status === 201) {
            console.log(
              "[v0] Full API response:",
              JSON.stringify(data, null, 2)
            );

            /*
             * Extract token and user data from API response
             * Backend may return: { token, user } or { session: { access_token }, user } or { access_token, user }
             * or the actual backend format: { session: { session, refresh_token, token_type, expires_in }, user }
             */
            let token = data.token || data.access_token;

            // Handle nested session object from actual backend
            if (!token && data.session) {
              console.log(
                "[v0] Found session object, checking for token inside:",
                data.session
              );
              // Check for access_token or other token names in session
              token = data.session.access_token || data.session.session;
            }

            const user = data.user || data;

            console.log(
              "[v0] Extracted token:",
              token?.substring(0, 50) + "..."
            );
            console.log("[v0] Extracted user:", user);

            if (!token) {
              console.error(
                "❌ No token found in response:",
                JSON.stringify(data)
              );
              throw new Error("No authentication token received from server");
            }

            if (!user || !user.id) {
              console.error(
                "❌ No user data found in response:",
                JSON.stringify(data)
              );
              throw new Error("No user data received from server");
            }

            // Remove sensitive information from user data
            const sanitizedUser = {
              ...user,
              // Remove sensitive fields if they exist
              password: undefined,
              passwordHash: undefined,
              salt: undefined,
              // Add any other sensitive fields you want to remove
            };

            // Debug: Log what we're returning from authorize
            const returnData = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              grade_id: user.grade_id,
              profile_image_url: user.profile_image_url,
              ...sanitizedUser,
              accessToken: token, // Store the JWT token for jwt callback
              session: data.session, // Store session data if it exists
            };

            console.log("[v0] Returning from authorize:", {
              id: returnData.id,
              email: returnData.email,
              hasToken: !!returnData.accessToken,
              hasSession: !!returnData.session,
            });

            // Return user data with token for NextAuth to process
            return returnData;
          }

          // Unexpected status code
          console.error("❌ Unexpected response status:", res.status);
          return null;
        } catch (e: any) {
          console.error("❌ Auth Error:", e.message);
          // If error is already a stringified JSON, throw as is
          if (e.message && e.message.startsWith("{")) {
            throw new Error(e.message);
          }
          // Otherwise, wrap in JSON format
          throw new Error(
            JSON.stringify({ detail: e.message || "Authentication failed" })
          );
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // ** ...add more providers here
  ],

  // ** Please refer to https://next-auth.js.org/configuration/options#session for more `session` options
  session: {
    /*
     * Choose how you want to save the user session.
     * The default is `jwt`, an encrypted JWT (JWE) stored in the session cookie.
     * If you use an `adapter` however, NextAuth default it to `database` instead.
     * You can still force a JWT session by explicitly defining `jwt`.
     * When using `database`, the session cookie will only contain a `sessionToken` value,
     * which is used to look up the session in the database.
     * If you use a custom credentials provider, user accounts will not be persisted in a database by NextAuth.js (even if one is configured).
     * The option to use JSON Web Tokens for session tokens must be enabled to use a custom credentials provider.
     */
    strategy: "jwt",

    // ** Seconds - How long until an idle session expires and is no longer valid
    maxAge: 30 * 24 * 60 * 60, // ** 30 days
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#pages for more `pages` options
  pages: {
    signIn: "/login",
  },

  // ** Please refer to https://next-auth.js.org/configuration/options#callbacks for more `callbacks` options
  callbacks: {
    /*
     * While using `jwt` as a strategy, `jwt()` callback will be called before
     * the `session()` callback. So we have to add custom parameters in `token`
     * via `jwt()` callback to make them accessible in the `session()` callback
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        /*
         * Store all user data and access token in the JWT token
         * This makes them available in the session callback
         */
        token.accessToken = user.accessToken;
        token.userData = {
          //@ts-ignore
          id: user.id,
          name: user.name,
          email: user.email,
          // Add any other user fields you want to store
          ...user,
        };
        // Store the nested session data if it exists
        if (user.session) {
          token.sessionData = user.session;
        }
        // Remove the accessToken from userData to avoid duplication
        delete token.userData.accessToken;
        delete token.userData.session;
      }

      // Handle session update triggered by `updateSession(newData)` on the client.
      // The API response user object is passed as `session` here — merge it into
      // the stored token so every part of the app reads the fresh values.
      if (trigger === "update" && session) {
        token.userData = {
          ...(token.userData as object),
          ...session,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }

      if (session.user && token.userData) {
        // ** Add all user data to session
        session.user = {
          ...session.user,
          ...token.userData,
        };

        // ** Add nested session data if it exists
        if (token.sessionData) {
          session.session = token.sessionData;
        }
      }

      return session;
    },
  },
};
