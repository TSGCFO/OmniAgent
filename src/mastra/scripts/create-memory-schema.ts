import "dotenv/config";
import { Pool } from "pg";

async function createMemorySchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔧 Creating memory schema...");
    
    // Create semantic_memories table for custom semantic storage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS semantic_memories (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        embedding VECTOR(1536) NOT NULL,
        metadata JSONB DEFAULT '{}',
        agent_name VARCHAR(255),
        thread_id VARCHAR(255),
        category VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'medium',
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ semantic_memories table created");
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_semantic_memories_embedding 
      ON semantic_memories USING ivfflat (embedding vector_cosine_ops) 
      WITH (lists = 100)
    `);
    console.log("✅ Vector index created");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_semantic_memories_category 
      ON semantic_memories (category)
    `);
    console.log("✅ Category index created");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_semantic_memories_agent_name 
      ON semantic_memories (agent_name)
    `);
    console.log("✅ Agent name index created");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_semantic_memories_thread_id 
      ON semantic_memories (thread_id)
    `);
    console.log("✅ Thread ID index created");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_semantic_memories_created_at 
      ON semantic_memories (created_at)
    `);
    console.log("✅ Created at index created");
    
    // Create function to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    console.log("✅ Update timestamp function created");
    
    // Create trigger for updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS update_semantic_memories_updated_at ON semantic_memories;
      CREATE TRIGGER update_semantic_memories_updated_at
        BEFORE UPDATE ON semantic_memories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log("✅ Update timestamp trigger created");
    
    console.log("✅ Memory schema creation complete");
    
  } catch (error) {
    console.error("❌ Error creating memory schema:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run schema creation
console.log("Starting memory schema creation...");
createMemorySchema()
  .then(() => console.log("✅ Database schema creation complete"))
  .catch((error) => {
    console.error("❌ Database schema creation failed:", error);
    process.exit(1);
  });
