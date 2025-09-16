import "dotenv/config";
import { Pool } from "pg";

async function initializePgVector() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔧 Initializing pgvector extension...");
    
    // Create pgvector extension if it doesn't exist
    await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
    console.log("✅ pgvector extension installed successfully");
    
    // Verify installation
    const result = await pool.query(`
      SELECT * FROM pg_extension WHERE extname = 'vector'
    `);
    
    if (result.rows.length > 0) {
      console.log("✅ Verified: pgvector extension is active");
      console.log("Extension details:", result.rows[0]);
    } else {
      console.error("❌ Warning: pgvector extension not found after installation");
    }
    
    // Check if vector type is available
    const typeCheck = await pool.query(`
      SELECT typname FROM pg_type WHERE typname = 'vector'
    `);
    
    if (typeCheck.rows.length > 0) {
      console.log("✅ Vector data type is available");
    }
    
  } catch (error) {
    console.error("❌ Error initializing pgvector:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization
console.log("Starting pgvector initialization...");
initializePgVector()
  .then(() => console.log("✅ Database initialization complete"))
  .catch((error) => {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  });