import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "https://better-app-deployment-server.vercel.app/api/auth",
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "better-auth",
      storage: SecureStore,
    }),
  ],
});

export const { useSession } = authClient;
