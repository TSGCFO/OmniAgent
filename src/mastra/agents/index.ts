// Re-export the factory pattern for proper initialization
export { createMainAgent, initializeMainAgent, getMainAgent } from "./agentFactory";

// Export a default mainAgent for backwards compatibility
// This will be properly initialized by the main index.ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { createOpenAI } from "@ai-sdk/openai";
import { semanticStorage } from "../tools/semanticStorage";
import { semanticRecall } from "../tools/semanticRecall";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Temporary fallback agent - will be replaced by properly initialized agent
export const mainAgent = new Agent({
  name: "AI Assistant (Fallback)",
  description: "Fallback agent - should be replaced by factory-created agent",
  instructions: "This is a fallback agent. The system should initialize the proper agent with MCP tools.",
  model: openai.responses("gpt-4o"),
  tools: {
    semanticStorage,
    semanticRecall,
  },
  memory: new Memory({
    storage: new PostgresStore({
      connectionString: process.env.DATABASE_URL!
    }),
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL!
    }),
    embedder: openai.embedding("text-embedding-3-small"),
    options: {
      threads: {
        generateTitle: true
      },
      lastMessages: 20,
      semanticRecall: {
        topK: 3,
        messageRange: 2
      },
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `# User Profile
## Identity
- **Name**: 
- **Role/Title**: 
- **Primary Goals**: 

## Preferences
- **Communication Style**: 
- **Working Hours**: 
- **Response Detail Level**: 

## Current Context
- **Active Projects**: 
- **Current Focus**: 
- **Important Deadlines**: 

## Technical Environment
- **Tech Stack**: 
- **Tools & Services**: 
- **API Keys/Integrations Available**: 

## Notes & Reminders
- **Important Notes**: 
- **Follow-ups Needed**: `
      }
    }
  }),
});