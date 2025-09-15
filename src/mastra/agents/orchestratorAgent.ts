import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { createOpenAI } from "@ai-sdk/openai";
import { getMCPTools } from "../mcp-client";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Create agent instance that will be initialized with tools
let orchestratorAgentInstance: Agent | null = null;

// Function to create and initialize the orchestrator agent with MCP tools
export async function createOrchestratorAgent() {
  try {
    const mcpTools = await getMCPTools();
    const logger = console;
    logger.log("🚀 [Orchestrator] Initializing with MCP tools...");
    
    // Create the agent with MCP tools included
    orchestratorAgentInstance = new Agent({
      name: "Main Orchestrator",
      description: "Main AI orchestrator that coordinates and delegates tasks to specialized sub-agents for comprehensive assistance",
      instructions: `You are the main AI orchestrator - a highly intelligent assistant that coordinates multiple specialized sub-agents to provide comprehensive help.

Your role is to:
1. Understand the user's needs and determine which specialized agent(s) should handle the task
2. Delegate tasks to the appropriate sub-agents:
   - Research Agent: For deep research, web searches, and information gathering
   - Email Agent: For email management, composition, and organization
   - Coding Agent: For programming tasks, code reviews, and technical assistance
   - Personal Assistant: For scheduling, reminders, and personal organization
3. Synthesize responses from multiple agents when needed
4. Learn from interactions to improve future responses
5. Maintain context across conversations using your memory system

Available capabilities through MCP server:
- Access to 500+ app integrations (Gmail, GitHub, Outlook, etc.)
- Web scraping and research tools
- File management and organization
- Database operations
- And many more through the rube.app MCP server

Always:
- Be proactive in offering assistance
- Provide comprehensive, well-researched responses
- Learn and adapt from user preferences
- Maintain conversation context
- Delegate complex tasks to specialized agents when appropriate

Remember: You have access to extensive tools through the MCP server. Use them wisely to provide the best assistance possible.`,
      model: openai.responses("gpt-4o"),
      tools: mcpTools && Object.keys(mcpTools).length > 0 ? mcpTools : {},
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
    
    if (mcpTools && Object.keys(mcpTools).length > 0) {
      logger.log(`✅ [Orchestrator] Loaded ${Object.keys(mcpTools).length} tools from MCP server`);
    } else {
      logger.warn("⚠️ [Orchestrator] No MCP tools available, continuing with basic functionality");
    }
    
    return orchestratorAgentInstance;
  } catch (error) {
    console.error("❌ [Orchestrator] Failed to initialize:", error);
    
    // Create a basic agent without MCP tools as fallback
    orchestratorAgentInstance = new Agent({
      name: "Main Orchestrator",
      description: "Main AI orchestrator that coordinates and delegates tasks",
      instructions: `You are the main AI orchestrator. While MCP tools are not available, you can still provide assistance using your knowledge and coordinate responses.`,
      model: openai.responses("gpt-4o"),
      tools: {},
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
    
    return orchestratorAgentInstance;
  }
}

// Export getter for the agent instance
export function getOrchestratorAgent() {
  if (!orchestratorAgentInstance) {
    throw new Error("Orchestrator agent not initialized. Call createOrchestratorAgent() first.");
  }
  return orchestratorAgentInstance;
}