import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "Set it to your Postgres connection string, e.g.: " +
      "postgresql://user:password@host:5432/dbname"
  );
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
