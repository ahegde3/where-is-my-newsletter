import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Configure for serverless environments (Vercel)
const client = postgres(connectionString, {
  prepare: false, // Required for Supabase connection pooler
  max: 1, // Limit connections in serverless
  ssl: "require",
});

export const db = drizzle(client, { schema });
