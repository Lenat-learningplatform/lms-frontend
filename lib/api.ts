import axios from "axios";
import { getSession } from "next-auth/react";

// Create Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_LARAVEL_API_URL,
  // baseURL: "https://lms.amanueld.info/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Bearer token
api.interceptors.request.use(
  async (config) => {
    console.log(
      "LARAVEL_API_URL:",
      process.env.LARAVEL_API_URL,
      "next",
      process.env.NEXT_PUBLIC_LARAVEL_API_URL
    );
    const session = await getSession();
    // Assert that session has accessToken
    const mySession = session as typeof session & { accessToken?: string };
    if (mySession?.accessToken) {
      config.headers.Authorization = `Bearer ${mySession.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
