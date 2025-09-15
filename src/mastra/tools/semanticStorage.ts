import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import { sharedDbPool } from "../storage";

// Initialize OpenAI for embeddings
const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

export const semanticStorage = createTool({
  id: "semantic-storage",
  description: "Store text content with semantic embeddings for later retrieval using similarity search",
  inputSchema: z.object({
    content: z.string().describe("The text content to store and embed"),
    metadata: z.record(z.any()).optional().default({}).describe("Additional metadata to store with the memory"),
    agentName: z.string().optional().describe("Name of the agent storing this memory"),
    threadId: z.string().optional().describe("Thread ID for conversation context"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.number().optional(),
    message: z.string(),
    embeddingDimensions: z.number().optional(),
  }),
  execute: async ({ context: { content, metadata, agentName, threadId }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🧠 [SemanticStorage] Starting to store semantic memory", {
      contentLength: content.length,
      hasMetadata: Object.keys(metadata || {}).length > 0,
      agentName,
      threadId,
    });
    
    try {
      // Generate embedding using OpenAI's text-embedding-3-small
      logger?.info("📝 [SemanticStorage] Generating embedding with text-embedding-3-small");
      const embeddingResult = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
      });
      
      const embedding = embeddingResult.embedding;
      logger?.info("✅ [SemanticStorage] Embedding generated successfully", {
        dimensions: embedding.length,
        sampleValues: embedding.slice(0, 3), // Log first 3 values as sample
      });
      
      // Use shared PostgreSQL storage
      logger?.info("🔌 [SemanticStorage] Using shared PostgreSQL storage");
      
      // Store in database
      const query = `
        INSERT INTO semantic_memories (
          content, 
          embedding, 
          metadata, 
          agent_name, 
          thread_id,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, created_at
      `;
      
      const embeddingJson = JSON.stringify(embedding);
      const metadataJson = JSON.stringify(metadata || {});
      
      logger?.info("💾 [SemanticStorage] Executing INSERT query", {
        embeddingJsonLength: embeddingJson.length,
        metadataKeys: Object.keys(metadata || {}),
      });
      
      const result = await sharedDbPool.query(query, [
        content,
        embeddingJson,
        metadataJson,
        agentName || null,
        threadId || null,
      ]);
      
      const insertedId = result.rows[0]?.id;
      const createdAt = result.rows[0]?.created_at;
      
      logger?.info("✅ [SemanticStorage] Successfully stored semantic memory", {
        id: insertedId,
        createdAt,
        contentPreview: content.substring(0, 100),
      });
      
      return {
        success: true,
        id: insertedId,
        message: `Semantic memory stored successfully with ID ${insertedId}`,
        embeddingDimensions: embedding.length,
      };
    } catch (error) {
      logger?.error("❌ [SemanticStorage] Failed to store semantic memory", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return {
        success: false,
        message: `Failed to store semantic memory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});