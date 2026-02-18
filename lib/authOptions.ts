// lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { AuthOptions } from "next-auth";

// JWT signing key: use env in production; in development use a fixed fallback so
// sessions persist on refresh without requiring you to set NEXTAUTH_SECRET.
const DEV_FALLBACK_SECRET =
  "lms-dev-session-secret-min-32-chars-for-nextauth";
const secret =
  process.env.NEXTAUTH_SECRET ||
  process.env.SECRET ||
  (process.env.NODE_ENV === "production" ? undefined : DEV_FALLBACK_SECRET);

if (!secret && process.env.NODE_ENV === "production") {
  throw new Error(
    "In production set NEXTAUTH_SECRET in .env for session persistence"
  );
}

export const authOptions: AuthOptions = {
  secret,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter your username and password.");
        }

        try {
          const baseUrl =
            process.env.LARAVEL_API_URL ||
            process.env.NEXT_PUBLIC_LARAVEL_API_URL;
          if (!baseUrl) {
            throw new Error("LARAVEL_API_URL or NEXT_PUBLIC_LARAVEL_API_URL is not set.");
          }
          const response = await axios.post(
            `${baseUrl}/login`,
            {
              username: credentials.username,
              password: credentials.password,
            }
          );

          if (
            !response.data.data ||
            !response.data.data.user ||
            !response.data.data.access_token
          ) {
            throw new Error("Invalid response from Laravel API.");
          }
          const user = response.data.data.user;

          return {
            ...user,
            roles: user.roles,
            accessToken: response.data.data.access_token,
            profile_photo_url: user.profile_photo_url,
            // accessToken: user.roles,
          };
        } catch (error: any) {
          console.error("Login Error:", error.response?.data || error.message);
          throw new Error(error.response?.data?.message || "Login failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.roles = user.roles;
        token.profile_photo_url = user.profile_photo_url;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.user = {
        ...session.user,
        id: token.sub as string,
        roles: token.roles as any[],
        profile_photo_url: token.profile_photo_url as string | undefined,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: false,
};
