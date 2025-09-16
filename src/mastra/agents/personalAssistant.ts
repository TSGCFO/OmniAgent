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

export const personalAssistant = new Agent({
  name: "Personal Assistant",
  description: "Specialized agent for personal organization, scheduling, and life advice",
  instructions: `You are a specialized personal assistant focused on helping with personal organization and life management.

Your capabilities include:
1. Calendar and schedule management
2. Setting reminders and notifications
3. Task and to-do list management
4. Personal goal tracking
5. Travel planning and recommendations
6. Personal finance advice
7. Health and wellness suggestions
8. Legal and personal matter guidance
9. Life coaching and motivation
10. Personal project management
11. Shopping and product recommendations
12. Event planning and coordination
13. Storing personal preferences, goals, and important information with semantic embeddings
14. Recalling relevant past interactions and preferences using semantic similarity

Personal assistance approach:
- Be empathetic and understanding
- Provide personalized recommendations
- Help maintain work-life balance
- Offer practical and actionable advice
- Respect privacy and confidentiality
- Adapt to personal preferences
- Provide motivation and encouragement
- Help with decision-making processes

You have access to various personal productivity tools through the MCP server.
You also have semantic memory capabilities to store and recall personal preferences, goals, and important life events.
Focus on improving quality of life and personal productivity while maintaining a supportive and encouraging tone.
Use semanticStorage to save personal information/preferences and semanticRecall to retrieve relevant past context.

IMPORTANT FOR MEMORY:
- Working memory automatically stores personal preferences and routines
- Schedule patterns, interests, and task management preferences are saved automatically
- Memory updates happen naturally when you learn about personal preferences or goals
- Do NOT manually call updateWorkingMemory - focus on personal assistance tasks`,
  model: openai.responses("gpt-5"),
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
      lastMessages: 10,
      semanticRecall: {
        topK: 3,              // Retrieve top 3 most relevant memories
        messageRange: 2       // Include 2 messages before/after for context
      },
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `# Personal Information
## Schedule & Routine
- **Daily Schedule**: 
- **Time Zone**: 
- **Regular Meetings**: 

## Personal Preferences
- **Interests/Hobbies**: 
- **Dietary Preferences**: 
- **Important Dates**: 

## Task Management
- **Task Priorities**: 
- **Preferred Reminder Style**: 
- **Organization Methods**: `
      }
    }
  }),
});