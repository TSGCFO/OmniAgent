import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import { sharedDbPool } from "../../storage";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

export const semanticStorage = createTool({
  id: "semantic-storage",
  description: "Store important information with semantic embeddings for intelligent retrieval across the OmniAgent Network",
  inputSchema: z.object({
    content: z.string().describe("The text content to store and embed for future retrieval"),
    category: z.enum(['research', 'email', 'coding', 'personal', 'general']).optional().describe("Category of information for better organization"),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium').describe("Priority level of this information"),
    tags: z.array(z.string()).optional().describe("Tags for better categorization and search"),
    metadata: z.object({}).passthrough().optional().default({}).describe("Additional metadata to store with the memory"),
    agentName: z.string().optional().describe("Name of the agent storing this memory"),
    threadId: z.string().optional().describe("Thread ID for conversation context"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.number().optional(),
    message: z.string(),
    embeddingDimensions: z.number().optional(),
    category: z.string().optional(),
  }),
  execute: async ({ context: { content, category, priority, tags, metadata, agentName, threadId }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🧠 [SemanticStorage] Storing network memory", {
      contentLength: content.length,
      category,
      priority,
      tags: tags?.length || 0,
      agentName,
      threadId,
    });
    
    try {
      // Generate embedding using OpenAI's text-embedding-3-small
      const embeddingResult = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: content,
      });
      
      const embedding = embeddingResult.embedding;
      logger?.info("✅ [SemanticStorage] Embedding generated", {
        dimensions: embedding.length,
      });
      
      // Enhanced metadata with network context
      const enhancedMetadata = {
        ...metadata,
        category: category || 'general',
        priority: priority || 'medium',
        tags: tags || [],
        agentName: agentName || 'unknown',
        threadId: threadId || null,
        storedAt: new Date().toISOString(),
        networkContext: 'omni-agent-network',
      };
      
      // Store in database with enhanced schema
      const query = `
        INSERT INTO semantic_memories (
          content, 
          embedding, 
          metadata, 
          agent_name, 
          thread_id,
          category,
          priority,
          tags,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, created_at
      `;
      
      const embeddingJson = JSON.stringify(embedding);
      const metadataJson = JSON.stringify(enhancedMetadata);
      const tagsJson = JSON.stringify(tags || []);
      
      const result = await sharedDbPool.query(query, [
        content,
        embeddingJson,
        metadataJson,
        agentName || null,
        threadId || null,
        category || 'general',
        priority || 'medium',
        tagsJson,
      ]);
      
      const insertedId = result.rows[0]?.id;
      const createdAt = result.rows[0]?.created_at;
      
      logger?.info("✅ [SemanticStorage] Memory stored successfully", {
        id: insertedId,
        category,
        priority,
        createdAt,
      });
      
      return {
        success: true,
        id: insertedId,
        message: `Semantic memory stored successfully with ID ${insertedId}`,
        embeddingDimensions: embedding.length,
        category: category || 'general',
      };
    } catch (error) {
      logger?.error("❌ [SemanticStorage] Failed to store memory", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        success: false,
        message: `Failed to store semantic memory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
