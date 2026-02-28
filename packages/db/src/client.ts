import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined in the environment");
}

// console.log("DATABASE_URL:", process.env.DATABASE_URL? "set":"not set");

const client = postgres(databaseUrl);

export const db = drizzle(client);
