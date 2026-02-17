"use client"; // Runs only on the client

import { getServerSession } from "next-auth";
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

import { authOptions } from "./authOptions";

export async function auth() {
  // For example, retrieve the session using NextAuth's getSession
  return await getServerSession(authOptions);
}

export async function signIn(provider: string, credentials?: any) {
  return await nextAuthSignIn(provider, credentials);
}

export async function signOut() {
  return await nextAuthSignOut();
}
