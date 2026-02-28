import { createAuthClient } from "better-auth/client";

export const auth = createAuthClient({
  baseURL: "https://better-app-deployment-server.vercel.app/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});
