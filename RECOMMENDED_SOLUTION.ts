// RECOMMENDED SOLUTION: Unified Agent Architecture

import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { createOpenAI } from "@ai-sdk/openai";
import { getMCPTools } from "../mcp-client";
import { delegateToSubAgent } from "../tools/delegateToSubAgent";
import { webScraper } from "../tools/webScraper";
import { deepResearch } from "../tools/deepResearch";
import { selfLearning } from "../tools/selfLearning";
import { semanticStorage } from "../tools/semanticStorage";
import { semanticRecall } from "../tools/semanticRecall";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Shared resource instances to avoid connection duplication
let sharedStorage: PostgresStore;
let sharedVector: PgVector;
let sharedEmbedder: any;

function getSharedResources() {
  if (!sharedStorage) {
    sharedStorage = new PostgresStore({
      connectionString: process.env.DATABASE_URL!
    });
  }
  if (!sharedVector) {
    sharedVector = new PgVector({
      connectionString: process.env.DATABASE_URL!
    });
  }
  if (!sharedEmbedder) {
    sharedEmbedder = openai.embedding("text-embedding-3-small");
  }
  return { sharedStorage, sharedVector, sharedEmbedder };
}

// SINGLE MAIN AGENT FACTORY - consolidates both approaches
export async function createMainAgent() {
  console.log("🚀 [MainAgent] Initializing with unified architecture...");
  
  try {
    // Load MCP tools
    const mcpTools = await getMCPTools();
    console.log(`✅ [MainAgent] Loaded ${Object.keys(mcpTools).length} MCP tools`);
    
    // Combine all tools
    const allTools = {
      ...mcpTools,
      delegateToSubAgent,
      webScraper,
      deepResearch,
      selfLearning,
      semanticStorage,
      semanticRecall,
    };
    
    // Get shared resources
    const { sharedStorage, sharedVector, sharedEmbedder } = getSharedResources();
    
    // Create unified agent
    const mainAgent = new Agent({
      name: "AI Assistant",
      description: "Comprehensive AI assistant with multi-agent coordination capabilities",
      instructions: `You are a comprehensive AI assistant with both direct capabilities and multi-agent coordination.

ARCHITECTURE:
You operate in a hybrid mode:
1. **Direct Capabilities**: Use your tools directly for straightforward tasks
2. **Agent Delegation**: Delegate complex specialized tasks to expert sub-agents
3. **MCP Integration**: Access 500+ external services via MCP tools

AVAILABLE TOOLS:
- MCP Tools (${Object.keys(mcpTools).length}): ${Object.keys(mcpTools).slice(0, 10).join(', ')}${Object.keys(mcpTools).length > 10 ? '...' : ''}
- Custom Tools: delegation, web scraping, research, learning, memory

DELEGATION STRATEGY:
Use delegateToSubAgent for:
- Complex research tasks → research agent
- Email management → email agent  
- Programming tasks → coding agent
- Personal organization → personal assistant

IMPORTANT:
- Maintain conversation context across delegations
- Use semantic memory to learn and recall
- Be proactive about updating working memory
- Provide comprehensive, well-researched responses

Your goal is to provide the most helpful assistance possible using all available resources.`,
      model: openai.responses("gpt-4"), // Use gpt-4 instead of non-existent gpt-5
      tools: allTools,
      memory: new Memory({
        storage: sharedStorage,
        vector: sharedVector,
        embedder: sharedEmbedder,
        options: {
          threads: {
            generateTitle: true,
          },
          lastMessages: 20,
          semanticRecall: {
            topK: 3,
            messageRange: 2,
          },
          workingMemory: {
            enabled: true,
            scope: 'resource',
            template: `# User Profile & Context
## Identity & Preferences
- **Name/Role**: 
- **Communication Style**: 
- **Key Interests**: 

## Current Projects & Goals
- **Active Projects**: 
- **Immediate Tasks**: 
- **Long-term Goals**: 

## Technical Context
- **Tech Stack**: 
- **Tools & Integrations**: 
- **API Access**: 

## Memory & Notes
- **Important Information**: 
- **Preferences**: 
- **Follow-up Items**: `
          }
        }
      }),
    });

    console.log(`✅ [MainAgent] Created unified agent with ${Object.keys(allTools).length} total tools`);
    return mainAgent;
    
  } catch (error) {
    console.error("❌ [MainAgent] Failed to initialize:", error);
    
    // Fallback agent with minimal tools
    const { sharedStorage, sharedVector, sharedEmbedder } = getSharedResources();
    
    const fallbackAgent = new Agent({
      name: "AI Assistant (Limited)",
      description: "AI assistant with limited capabilities",
      instructions: `You are an AI assistant running in fallback mode. MCP tools are not available, but you can still help with:
- General questions and assistance
- Delegation to specialized sub-agents
- Basic web scraping and research
- Memory management

Use delegation tools when appropriate for specialized tasks.`,
      model: openai.responses("gpt-4"),
      tools: {
        delegateToSubAgent,
        webScraper,
        deepResearch,
        selfLearning,
        semanticStorage,
        semanticRecall,
      },
      memory: new Memory({
        storage: sharedStorage,
        vector: sharedVector,
        embedder: sharedEmbedder,
        options: {
          threads: { generateTitle: true },
          lastMessages: 20,
          workingMemory: { enabled: true, scope: 'resource' }
        }
      }),
    });
    
    console.log("⚠️ [MainAgent] Using fallback agent with limited tools");
    return fallbackAgent;
  }
}

// Factory for specialized agents with shared resources
export function createSpecializedAgent(config: {
  name: string;
  description: string;
  instructions: string;
  customTools?: any;
}) {
  const { sharedStorage, sharedVector, sharedEmbedder } = getSharedResources();
  
  return new Agent({
    name: config.name,
    description: config.description,
    instructions: config.instructions,
    model: openai.responses("gpt-4"),
    tools: {
      semanticStorage,
      semanticRecall,
      ...config.customTools,
    },
    memory: new Memory({
      storage: sharedStorage,
      vector: sharedVector,
      embedder: sharedEmbedder,
      options: {
        threads: { generateTitle: true },
        lastMessages: 10, // Specialized agents need less context
        semanticRecall: { topK: 3, messageRange: 2 },
        workingMemory: { enabled: true, scope: 'resource' }
      }
    }),
  });
}