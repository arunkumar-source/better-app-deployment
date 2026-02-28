import { expo } from "@better-auth/expo";
import { account, db, session, user } from "@repo/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import dotenv from "dotenv";

dotenv.config();

export const auth = betterAuth({
  plugins: [expo()],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
    },
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:4000",
    "https://better-app-deployment-server.vercel.app",
    "mobile://",
    "exp://",
  ],
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  url: process.env.BETTER_AUTH_URL,
});
