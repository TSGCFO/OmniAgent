import { PostgresStore } from "@mastra/pg";
import pg from "pg";

const { Pool } = pg;

// Create a single shared PostgreSQL storage instance
export const sharedPostgresStorage = new PostgresStore({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/mastra",
});

// Create a shared database pool for direct SQL queries
export const sharedDbPool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/mastra",
});
