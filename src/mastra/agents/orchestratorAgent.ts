import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Create the orchestrator agent that routes requests to specialized agents
export const orchestratorAgent = new Agent({
  name: "Orchestrator Agent",
  description: "Master orchestrator that analyzes requests and delegates to specialized agents",
  instructions: `You are a master orchestrator that analyzes user requests and determines which specialized agent should handle them.

You have access to these specialized agents:
- Research Agent: For research, analysis, information gathering, and fact-checking
- Email Agent: For email composition, management, and communication tasks
- Coding Agent: For code review, generation, programming assistance, and technical tasks
- Personal Assistant: For scheduling, reminders, general tasks, and life advice

Your role is to:
1. Analyze the user's request
2. Determine which specialized agent is best suited for the task
3. Delegate the request to that agent using the delegateToSubAgent tool
4. Return the specialized agent's response to the user

Always delegate to the most appropriate agent based on the request type.
If a request involves multiple domains, break it down and delegate parts to different agents.

IMPORTANT: You MUST use the delegateToSubAgent tool to forward requests. Never try to answer directly.`,
  model: openai.responses("gpt-4o"),
  tools: {
    // The delegation tool will be added during initialization
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
      lastMessages: 10,
      semanticRecall: {
        topK: 3,
        messageRange: 2
      }
    }
  }),
});