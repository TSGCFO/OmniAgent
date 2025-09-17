import { PostgresStore } from "@mastra/pg";
import pg from "pg";

const { Pool } = pg;

// Create a single shared PostgreSQL storage instance
// Check for DATABASE_URL before creating storage
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.error("Please create a .env file with your database configuration.");
  console.error("See ENV_SETUP.md for instructions.");
  process.exit(1);
}

export const sharedPostgresStorage = new PostgresStore({
  connectionString: process.env.DATABASE_URL,
});

// Create a shared database pool for direct SQL queries
export const sharedDbPool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://localhost:5432/mastra",
});
