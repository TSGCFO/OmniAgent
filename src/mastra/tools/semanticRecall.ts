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

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

export const semanticRecall = createTool({
  id: "semantic-recall",
  description: "Search and retrieve semantically similar memories using cosine similarity search",
  inputSchema: z.object({
    query: z.string().describe("The query text to search for similar memories"),
    topK: z.number().optional().default(5).describe("Number of top similar memories to return"),
    agentName: z.string().optional().describe("Filter memories by agent name"),
    threadId: z.string().optional().describe("Filter memories by thread ID"),
    minSimilarity: z.number().optional().default(0.5).describe("Minimum similarity score threshold (0-1)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    memories: z.array(z.object({
      id: z.number(),
      content: z.string(),
      similarity: z.number(),
      metadata: z.record(z.any()),
      agentName: z.string().nullable(),
      threadId: z.string().nullable(),
      createdAt: z.string(),
    })),
    message: z.string(),
    totalScanned: z.number().optional(),
    queryDimensions: z.number().optional(),
  }),
  execute: async ({ context: { query, topK, agentName, threadId, minSimilarity }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🔍 [SemanticRecall] Starting semantic memory search", {
      queryLength: query.length,
      topK,
      agentName,
      threadId,
      minSimilarity,
    });
    
    try {
      // Generate embedding for the query
      logger?.info("📝 [SemanticRecall] Generating query embedding with text-embedding-3-small");
      const embeddingResult = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      });
      
      const queryEmbedding = embeddingResult.embedding;
      logger?.info("✅ [SemanticRecall] Query embedding generated successfully", {
        dimensions: queryEmbedding.length,
        sampleValues: queryEmbedding.slice(0, 3),
      });
      
      // Use shared PostgreSQL storage
      logger?.info("🔌 [SemanticRecall] Using shared PostgreSQL storage");
      
      // Build query with optional filters
      let queryStr = `
        SELECT 
          id,
          content,
          embedding,
          metadata,
          agent_name,
          thread_id,
          created_at
        FROM semantic_memories
        WHERE 1=1
      `;
      
      const queryParams: any[] = [];
      let paramCount = 0;
      
      if (agentName) {
        paramCount++;
        queryStr += ` AND agent_name = $${paramCount}`;
        queryParams.push(agentName);
      }
      
      if (threadId) {
        paramCount++;
        queryStr += ` AND thread_id = $${paramCount}`;
        queryParams.push(threadId);
      }
      
      queryStr += ` ORDER BY created_at DESC LIMIT 1000`; // Limit to prevent OOM
      
      logger?.info("💾 [SemanticRecall] Fetching memories from database", {
        hasAgentFilter: !!agentName,
        hasThreadFilter: !!threadId,
      });
      
      const result = await sharedDbPool.query(queryStr, queryParams);
      
      logger?.info("📊 [SemanticRecall] Retrieved memories from database", {
        totalMemories: result.rows.length,
      });
      
      if (result.rows.length === 0) {
        logger?.info("⚠️ [SemanticRecall] No memories found in database");
        return {
          success: true,
          memories: [],
          message: "No memories found",
          totalScanned: 0,
          queryDimensions: queryEmbedding.length,
        };
      }
      
      // Calculate cosine similarity for each memory
      logger?.info("🧮 [SemanticRecall] Calculating cosine similarities");
      const memoriesWithSimilarity = result.rows.map((row, index) => {
        try {
          // PostgreSQL JSON type returns the data already parsed, not as a string
          const storedEmbedding = typeof row.embedding === 'string' 
            ? JSON.parse(row.embedding) as number[]
            : row.embedding as number[];
          
          // Additional debug logging
          if (index === 0) {
            logger?.info(`🔬 [SemanticRecall] Debug - Query embedding dimensions: ${queryEmbedding.length}`);
            logger?.info(`🔬 [SemanticRecall] Debug - Stored embedding dimensions: ${storedEmbedding.length}`);
            logger?.info(`🔬 [SemanticRecall] Debug - Query embedding sample: [${queryEmbedding.slice(0, 3).join(', ')}]`);
            logger?.info(`🔬 [SemanticRecall] Debug - Stored embedding sample: [${storedEmbedding.slice(0, 3).join(', ')}]`);
          }
          
          const similarity = cosineSimilarity(queryEmbedding, storedEmbedding);
          
          // Always log similarity scores for debugging
          logger?.info(`📐 [SemanticRecall] Memory ${row.id} similarity score`, {
            memoryId: row.id,
            similarity: similarity,
            contentPreview: row.content.substring(0, 50),
          });
          
          return {
            ...row,
            similarity,
          };
        } catch (error) {
          logger?.error(`❌ [SemanticRecall] Error processing memory ${row.id}`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          return {
            ...row,
            similarity: 0,
          };
        }
      });
      
      // Filter by minimum similarity and sort by similarity
      logger?.info("🎯 [SemanticRecall] Filtering and sorting by similarity", {
        minSimilarity,
      });
      
      const filteredMemories = memoriesWithSimilarity
        .filter(m => m.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
      
      logger?.info("✅ [SemanticRecall] Search completed successfully", {
        totalScanned: result.rows.length,
        filtered: filteredMemories.length,
        topSimilarity: filteredMemories[0]?.similarity,
        lowestSimilarity: filteredMemories[filteredMemories.length - 1]?.similarity,
      });
      
      // Format the results
      const formattedMemories = filteredMemories.map(memory => ({
        id: memory.id,
        content: memory.content,
        similarity: Math.round(memory.similarity * 1000) / 1000, // Round to 3 decimal places
        metadata: memory.metadata || {},
        agentName: memory.agent_name,
        threadId: memory.thread_id,
        createdAt: memory.created_at.toISOString(),
      }));
      
      logger?.info("📤 [SemanticRecall] Returning formatted memories", {
        count: formattedMemories.length,
        ids: formattedMemories.map(m => m.id),
      });
      
      return {
        success: true,
        memories: formattedMemories,
        message: `Found ${formattedMemories.length} relevant memories`,
        totalScanned: result.rows.length,
        queryDimensions: queryEmbedding.length,
      };
    } catch (error) {
      logger?.error("❌ [SemanticRecall] Failed to recall semantic memories", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      return {
        success: false,
        memories: [],
        message: `Failed to recall memories: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});