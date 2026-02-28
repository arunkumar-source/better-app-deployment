import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: "http://192.168.1.20:4000/api/auth",
  plugins: [
    expoClient({
      scheme: "mobile",
      storagePrefix: "better-auth",
      storage: SecureStore,
    }),
  ],
});

export const { useSession } = authClient;
