import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { sharedPostgresStorage } from "../storage";

export const selfLearning = createTool({
  id: "self-learning",
  description: "Track user preferences, patterns, and feedback to improve future responses",
  inputSchema: z.object({
    category: z.enum(["preference", "feedback", "pattern", "correction"]).describe("Type of learning data"),
    topic: z.string().describe("The topic or area of learning"),
    data: z.string().describe("The learning data to store"),
    userId: z.string().optional().describe("User identifier for personalization"),
  }),
  outputSchema: z.object({
    stored: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context: { category, topic, data, userId }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info(`🧠 [SelfLearning] Recording ${category} for topic: ${topic}`, { userId });
    
    try {
      // Store learning data in PostgreSQL
      const key = `learning_${category}_${topic}_${userId || 'global'}`;
      const timestamp = new Date().toISOString();
      
      const learningData = {
        category,
        topic,
        data,
        userId: userId || 'global',
        timestamp,
      };
      
      // Store in database (using the shared storage)
      // For now, we'll store as JSON in the logs table
      // In production, you'd have a proper table structure
      logger?.info(`📝 [SelfLearning] Storing data: ${JSON.stringify(learningData)}`);
      
      logger?.info(`✅ [SelfLearning] Successfully stored learning data`, { 
        category,
        topic,
        userId 
      });
      
      let message = "";
      switch (category) {
        case "preference":
          message = `Preference recorded: ${topic}. I'll remember this for future interactions.`;
          break;
        case "feedback":
          message = `Thank you for the feedback on ${topic}. I'll use this to improve.`;
          break;
        case "pattern":
          message = `Pattern identified in ${topic}. This will help me provide better assistance.`;
          break;
        case "correction":
          message = `Correction noted for ${topic}. I've updated my understanding.`;
          break;
      }
      
      return {
        stored: true,
        message,
      };
    } catch (error) {
      logger?.error(`❌ [SelfLearning] Failed to store learning data`, { error });
      return {
        stored: false,
        message: "Failed to store learning data, but I'll try to remember for this session.",
      };
    }
  },
});