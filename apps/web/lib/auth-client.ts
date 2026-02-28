import { createAuthClient } from "better-auth/client";

export const auth = createAuthClient({
  baseURL: "http://localhost:4000/api/auth",
  credentials: "include",
});
