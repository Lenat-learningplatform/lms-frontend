// lib/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  secret: process.env.SECRET,
  session: { strategy: "jwt" },
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
          const response = await axios.post(
            `${process.env.LARAVEL_API_URL}/login`,
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
    async session({ session, token, user }) {
      console.log({ session, token, user, secret: process.env.SECRET });
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
  debug: true,
};
