import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { createOpenAI } from "@ai-sdk/openai";
import { getMCPTools } from "../mcp-client";
import { delegateToSubAgent } from "../tools/delegateToSubAgent";
import { webScraper } from "../tools/webScraper";
import { deepResearch } from "../tools/deepResearch";
import { selfLearning } from "../tools/selfLearning";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Create the main AI assistant agent
export async function createMainAgent() {
  try {
    const logger = console;
    logger.log("🚀 [MainAgent] Initializing with MCP tools...");
    
    // Get MCP tools from the server
    const mcpTools = await getMCPTools();
    
    // Combine MCP tools with our custom tools
    const allTools = {
      ...mcpTools,
      delegateToSubAgent,
      webScraper,
      deepResearch,
      selfLearning,
    };
    
    if (Object.keys(allTools).length > 0) {
      logger.log(`✅ [MainAgent] Loaded ${Object.keys(allTools).length} total tools`);
    } else {
      logger.warn("⚠️ [MainAgent] No tools available, continuing with basic functionality");
    }
    
    // Create the main agent with all tools
    const mainAgent = new Agent({
      name: "AI Assistant",
      description: "Comprehensive AI assistant with access to 500+ integrations and specialized capabilities",
      instructions: `You are a comprehensive AI assistant with access to extensive tools and capabilities.

Your role is to provide intelligent, thorough assistance for any task. You have:

1. **500+ App Integrations** through MCP server:
   - Email services (Gmail, Outlook)
   - Development tools (GitHub, GitLab)
   - Productivity apps (Slack, Notion, Airtable)
   - Cloud services (AWS, Azure, GCP)
   - And many more

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

Approach:
- Be proactive and thorough in your assistance
- Use appropriate tools for each task
- Delegate to specialized agents when needed for complex tasks
- Learn from interactions to improve future responses
- Maintain context across conversations
- Provide well-researched, accurate information

Always strive to provide the most comprehensive and helpful assistance possible.
Remember to use your extensive toolkit wisely to deliver exceptional results.`,
      model: openai.responses("gpt-5"),
      tools: allTools,
      memory: new Memory({
        options: {
          threads: {
            generateTitle: true,
          },
          lastMessages: 20,
        },
        storage: sharedPostgresStorage,
      }),
    });
    
    return mainAgent;
  } catch (error) {
    console.error("❌ [MainAgent] Failed to initialize:", error);
    
    // Create a basic agent without MCP tools as fallback
    const fallbackAgent = new Agent({
      name: "AI Assistant",
      description: "AI assistant with limited capabilities",
      instructions: `You are an AI assistant. While external tools are not available, you can still provide assistance using your knowledge and the available delegation tools.`,
      model: openai.responses("gpt-5"),
      tools: {
        delegateToSubAgent,
        webScraper,
        deepResearch,
        selfLearning,
      },
      memory: new Memory({
        options: {
          threads: {
            generateTitle: true,
          },
          lastMessages: 20,
        },
        storage: sharedPostgresStorage,
      }),
    });
    
    return fallbackAgent;
  }
}