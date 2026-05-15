import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * Global singleton to prevent creating multiple connections in dev (HMR).
 */
const globalForDb = globalThis as unknown as { _pgClient?: ReturnType<typeof postgres> };

const client =
  globalForDb._pgClient ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pgClient = client;
}

export const db = drizzle(client, { schema });

// Re-export schema and drizzle helpers for convenience
export { schema };
export { eq, desc, and, sql, asc } from "drizzle-orm";
