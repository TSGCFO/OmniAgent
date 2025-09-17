import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { embed } from "ai";
import { sharedDbPool } from "../../storage";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

export const semanticRecall = createTool({
  id: "semantic-recall",
  description: "Retrieve relevant information from semantic memory using similarity search across the OmniAgent Network",
  inputSchema: z.object({
    query: z.string().describe("The search query to find relevant stored information"),
    category: z.enum(['research', 'email', 'coding', 'personal', 'general', 'all']).optional().describe("Filter by category (default: all)"),
    priority: z.enum(['low', 'medium', 'high', 'critical', 'all']).optional().describe("Filter by priority level (default: all)"),
    limit: z.number().min(1).max(20).optional().default(5).describe("Maximum number of results to return"),
    agentName: z.string().optional().describe("Filter by agent name"),
    threadId: z.string().optional().describe("Filter by thread ID"),
    minSimilarity: z.number().min(0).max(1).optional().default(0.7).describe("Minimum similarity threshold (0-1)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    results: z.array(z.object({
      id: z.number(),
      content: z.string(),
      category: z.string(),
      priority: z.string(),
      tags: z.array(z.string()),
      agentName: z.string().optional(),
      threadId: z.string().optional(),
      similarity: z.number(),
      metadata: z.record(z.any()),
      createdAt: z.string(),
    })),
    totalFound: z.number(),
    query: z.string(),
    message: z.string(),
  }),
  execute: async ({ context: { query, category, priority, limit, agentName, threadId, minSimilarity }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🔍 [SemanticRecall] Searching network memory", {
      query: query.substring(0, 100),
      category,
      priority,
      limit,
      agentName,
      threadId,
      minSimilarity,
    });
    
    try {
      // Generate embedding for the query
      const embeddingResult = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: query,
      });
      
      const queryEmbedding = embeddingResult.embedding;
      logger?.info("✅ [SemanticRecall] Query embedding generated", {
        dimensions: queryEmbedding.length,
      });
      
      // Build dynamic WHERE clause based on filters
      let whereConditions = ['1=1']; // Base condition
      const queryParams = [JSON.stringify(queryEmbedding), minSimilarity];
      let paramIndex = 3;
      
      if (category && category !== 'all') {
        whereConditions.push(`category = $${paramIndex}`);
        queryParams.push(category);
        paramIndex++;
      }
      
      if (priority && priority !== 'all') {
        whereConditions.push(`priority = $${paramIndex}`);
        queryParams.push(priority);
        paramIndex++;
      }
      
      if (agentName) {
        whereConditions.push(`agent_name = $${paramIndex}`);
        queryParams.push(agentName);
        paramIndex++;
      }
      
      if (threadId) {
        whereConditions.push(`thread_id = $${paramIndex}`);
        queryParams.push(threadId);
        paramIndex++;
      }
      
      // Use cosine similarity for better results
      const similarityQuery = `
        SELECT 
          id,
          content,
          category,
          priority,
          tags,
          agent_name,
          thread_id,
          metadata,
          created_at,
          (embedding <=> $1) as distance,
          (1 - (embedding <=> $1)) as similarity
        FROM semantic_memories
        WHERE ${whereConditions.join(' AND ')}
        AND (1 - (embedding <=> $1)) >= $2
        ORDER BY embedding <=> $1
        LIMIT $${paramIndex}
      `;
      
      queryParams.push(limit);
      
      logger?.info("🔍 [SemanticRecall] Executing similarity search", {
        whereConditions,
        paramCount: queryParams.length,
      });
      
      const result = await sharedDbPool.query(similarityQuery, queryParams);
      
      const results = result.rows.map(row => ({
        id: row.id,
        content: row.content,
        category: row.category || 'general',
        priority: row.priority || 'medium',
        tags: row.tags || [],
        agentName: row.agent_name,
        threadId: row.thread_id,
        similarity: parseFloat(row.similarity),
        metadata: row.metadata || {},
        createdAt: row.created_at,
      }));
      
      logger?.info("✅ [SemanticRecall] Search completed", {
        resultsFound: results.length,
        avgSimilarity: results.length > 0 ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length : 0,
      });
      
      return {
        success: true,
        results,
        totalFound: results.length,
        query,
        message: `Found ${results.length} relevant memories`,
      };
    } catch (error) {
      logger?.error("❌ [SemanticRecall] Search failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        success: false,
        results: [],
        totalFound: 0,
        query,
        message: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
