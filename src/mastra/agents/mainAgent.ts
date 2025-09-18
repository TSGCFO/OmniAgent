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

1. **500+ App Integrations** through MCP server (accessed via meta-tools):
   To access external services like Gmail, GitHub, Slack, etc., you must:
   a) Use 'rubeApp_RUBE_SEARCH_TOOLS' to discover available integrations for the user's request
   b) Use 'rubeApp_RUBE_MANAGE_CONNECTIONS' to establish connections to services if needed
   c) Use 'rubeApp_RUBE_CREATE_PLAN' to create an execution plan after searching
   d) Use 'rubeApp_RUBE_MULTI_EXECUTE_TOOL' to execute multiple tools in sequence
   
   Available integration categories:
   - Email services (Gmail, Outlook)
   - Development tools (GitHub, GitLab)
   - Productivity apps (Slack, Notion, Airtable)
   - Cloud services (AWS, Azure, GCP)
   - Social media platforms
   - Payment systems (Stripe, PayPal)
   - And hundreds more

2. **MCP Meta-Tools** (your gateway to integrations):
   - rubeApp_RUBE_SEARCH_TOOLS: Search for available tools/integrations matching user's needs
   - rubeApp_RUBE_MANAGE_CONNECTIONS: Set up and manage connections to external services
   - rubeApp_RUBE_CREATE_PLAN: Generate step-by-step execution plans
   - rubeApp_RUBE_MULTI_EXECUTE_TOOL: Execute multiple tools in workflows
   - rubeApp_RUBE_REMOTE_BASH_TOOL: Execute remote bash commands
   - rubeApp_RUBE_REMOTE_WORKBENCH: Remote development environment

3. **Local Specialized Capabilities**:
   - delegateToSubAgent: Delegate to specialized agents (research, email, coding, personal)
   - webScraper: Direct web page scraping
   - deepResearch: Conduct in-depth research
   - selfLearning: Track and learn from user preferences

4. **Built-in Semantic Memory**:
   - Automatic conversation context maintenance across sessions
   - Thread-based memory that persists in PostgreSQL
   - Keeps context of last 20 messages for optimal understanding
   - Automatically generates titles for conversation threads
   - All interactions are automatically stored and recalled when relevant

IMPORTANT WORKFLOW for external integrations:
1. When user asks for external service integration (e.g., "send an email", "check GitHub"), ALWAYS start with rubeApp_RUBE_SEARCH_TOOLS
2. The search will return available tools and a session_id - keep this session_id for subsequent calls
3. Use rubeApp_RUBE_MANAGE_CONNECTIONS if new connections are needed
4. Call rubeApp_RUBE_CREATE_PLAN with the session_id to get a proper execution plan
5. Follow the plan using the appropriate tools

Approach:
- For external services, ALWAYS search first with rubeApp_RUBE_SEARCH_TOOLS
- Be proactive and thorough in your assistance
- Use appropriate tools for each task
- Maintain the session_id throughout multi-step workflows
- Your memory automatically maintains context - no need for explicit storage
- Provide well-researched, accurate information

Always strive to provide the most comprehensive and helpful assistance possible.
Remember: Access to 500+ integrations requires using the MCP meta-tools workflow, not direct tool calls.`,
      model: openai.responses("gpt-4o"),
      tools: allTools,
      memory: new Memory({
        options: {
          threads: {
            generateTitle: true, // Automatically generate titles for conversation threads
          },
          lastMessages: 20, // Keep last 20 messages for context and semantic understanding
        },
        storage: sharedPostgresStorage, // Use PostgreSQL for persistent semantic memory
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
      model: openai.responses("gpt-4o"),
      tools: {
        delegateToSubAgent,
        webScraper,
        deepResearch,
        selfLearning,
      },
      memory: new Memory({
        options: {
          threads: {
            generateTitle: true, // Automatically generate titles for conversation threads
          },
          lastMessages: 20, // Keep last 20 messages for context and semantic understanding
        },
        storage: sharedPostgresStorage, // Use PostgreSQL for persistent semantic memory
      }),
    });
    
    return fallbackAgent;
  }
}