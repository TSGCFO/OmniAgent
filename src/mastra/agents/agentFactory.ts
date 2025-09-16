import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { createOpenAI } from "@ai-sdk/openai";
import { semanticStorage } from "../tools/semanticStorage";
import { semanticRecall } from "../tools/semanticRecall";
import { getMCPTools } from "../mcp-client";
import { delegateToSubAgent } from "../tools/delegateToSubAgent";
import { webScraper } from "../tools/webScraper";
import { deepResearch } from "../tools/deepResearch";
import { selfLearning } from "../tools/selfLearning";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Factory function to create the main agent with all tools including MCP
export async function createMainAgent() {
  console.log("🔧 Loading MCP tools from rube.app...");
  
  // Load MCP tools first - this is critical!
  let mcpTools = {};
  try {
    mcpTools = await getMCPTools();
    console.log(`✅ Loaded ${Object.keys(mcpTools).length} MCP tools successfully`);
  } catch (error) {
    console.error("❌ Failed to load MCP tools:", error);
    console.log("⚠️ Continuing without MCP tools");
  }
  
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
  
  console.log(`✅ Creating main agent with ${Object.keys(allTools).length} total tools:`);
  console.log(`  - ${Object.keys(mcpTools).length} MCP tools from rube.app`);
  console.log(`  - ${Object.keys(allTools).length - Object.keys(mcpTools).length} custom tools`);
  
  // Create the main AI assistant agent with comprehensive capabilities
  return new Agent({
    name: "AI Assistant",
    description: "Comprehensive AI assistant with access to 500+ integrations and specialized capabilities",
    instructions: `You are a comprehensive AI assistant with access to extensive tools and capabilities.

Your role is to provide intelligent, thorough assistance for any task. You have:

1. **500+ App Integrations** through MCP server (rube.app):
   - Email services (Gmail, Outlook)
   - Development tools (GitHub, GitLab)
   - Productivity apps (Slack, Notion, Airtable)
   - Cloud services (AWS, Azure, GCP)
   - Social media platforms
   - Payment systems (Stripe, PayPal)
   - Communication tools (Telegram, Discord)
   - And hundreds more tools available through the MCP server
   
   Available MCP tools include: ${Object.keys(mcpTools).join(', ') || 'No MCP tools loaded'}

2. **Specialized Capabilities** through delegation:
   - Research: Deep web searches, information synthesis, fact-checking
   - Email: Email management, composition, organization
   - Coding: Programming assistance, code reviews, GitHub management
   - Personal: Scheduling, reminders, life advice, personal organization

3. **Advanced Features**:
   - Web scraping and data extraction
   - Deep research with multiple sources
   - Self-learning to improve over time
   - Memory of conversations and preferences
   - Semantic memory for intelligent recall

Approach:
- Be proactive and thorough in your assistance
- Use appropriate MCP tools for each task - you have access to ${Object.keys(mcpTools).length} MCP tools
- Check what MCP tools are available and use them when relevant
- Delegate to specialized agents when needed for complex tasks
- Learn from interactions to improve future responses
- Maintain context across conversations
- Provide well-researched, accurate information

IMPORTANT FOR MEMORY:
- Working memory updates happen automatically when you learn new information about the user
- Working memory persists across all conversations using the resource-scoped configuration
- Memory is automatically saved when you discover user preferences, goals, or context
- Do NOT try to manually call updateWorkingMemory - this happens automatically
- Focus on naturally acknowledging what you've learned in your responses

MCP TOOLS AVAILABLE:
${Object.keys(mcpTools).length > 0 ? `You have access to ${Object.keys(mcpTools).length} MCP tools. Use them to interact with external services. The available tools are: ${Object.keys(mcpTools).slice(0, 20).join(', ')}${Object.keys(mcpTools).length > 20 ? ', and more...' : ''}` : 'MCP tools are not currently available, but you still have custom tools.'}

Always strive to provide the most comprehensive and helpful assistance possible.
Remember to use your extensive toolkit wisely to deliver exceptional results.`,
    model: openai.responses("gpt-5"),
    tools: allTools,  // All tools including MCP tools are properly registered here
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
          topK: 3,              // Retrieve top 3 most relevant memories
          messageRange: 2       // Include 2 messages before/after for context
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
}

// Singleton pattern for the main agent
let _mainAgent: Agent | null = null;

// Initialize the agent (called once on startup)
export async function initializeMainAgent(): Promise<Agent> {
  if (!_mainAgent) {
    _mainAgent = await createMainAgent();
    console.log("✅ Main agent initialized and ready");
  }
  return _mainAgent;
}

// Get the initialized agent (throws if not initialized)
export function getMainAgent(): Agent {
  if (!_mainAgent) {
    throw new Error("Main agent not initialized. The application must call initializeMainAgent() on startup.");
  }
  return _mainAgent;
}