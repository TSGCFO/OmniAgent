import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';
import { createOpenAI } from '@ai-sdk/openai';
import { TokenLimiter, ToolCallFilter } from '@mastra/memory/processors';

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Unified memory configuration for the entire OmniAgent system
// Based on official Mastra examples: memory-with-pg and memory-with-processors
export const unifiedMemory = new Memory({
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!
  }),
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL!
  }),
  embedder: openai.embedding("text-embedding-3-small"),
  processors: [
    // Filter out verbose tool calls to save tokens
    new ToolCallFilter({ exclude: ["semantic-storage", "semantic-recall"] }),
    // Limit memory to prevent context window overflow
    new TokenLimiter(127000), // GPT-4o context limit
  ],
  options: {
    threads: {
      generateTitle: {
        model: openai("gpt-4o-mini"),
        instructions: "Generate a concise, descriptive title for this conversation thread based on the user's message."
      }
    },
    lastMessages: 10, // Standard from examples
    semanticRecall: {
      topK: 3,              // Standard from examples
      messageRange: 2,      // Standard from examples
      scope: 'resource'     // Enable cross-thread memory
    },
    workingMemory: {
      enabled: true,
      scope: 'resource',
      // Proper template format following official examples
      template: `# User Profile

## Personal Info
- Name:
- Location:
- Timezone:

## Preferences
- Communication Style: [e.g., Formal, Casual]
- Project Goal:
- Key Deadlines:
  - [Deadline 1]: [Date]
  - [Deadline 2]: [Date]

## Session State
- Last Task Discussed:
- Open Questions:
  - [Question 1]
  - [Question 2]

## Agent-Specific Context
### Research Agent
- Research Depth:
- Trusted Sources:
- Research Patterns:

### Email Agent
- Email Accounts:
- Communication Style:
- Priority Contacts:

### Coding Agent
- Primary Languages:
- Framework Choices:
- Code Style:
- Testing Approach:

### Personal Assistant
- Schedule Patterns:
- Task Management:
- Reminder Preferences:`
    }
  }
});

// Note: All agents now use the unified memory system
// Specialized templates are handled through agent instructions and context
