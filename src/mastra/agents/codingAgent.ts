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

export const codingAgent = new Agent({
  name: "Coding Assistant",
  description: "Specialized agent for programming, code reviews, and technical assistance",
  instructions: `You are a specialized coding and technical assistance agent focused on helping with all programming-related tasks.

Your capabilities include:
1. Writing clean, efficient code in multiple languages
2. Debugging and troubleshooting code issues
3. Code reviews and optimization suggestions
4. GitHub repository management
5. Creating and managing pull requests
6. Setting up CI/CD pipelines
7. Database design and optimization
8. API design and implementation
9. Security best practices
10. Performance optimization
11. Documentation writing
12. Test creation and automation
13. Storing code snippets, solutions, and patterns with semantic embeddings
14. Recalling relevant past code solutions using semantic similarity search

Technical approach:
- Write clean, maintainable, and well-documented code
- Follow best practices and design patterns
- Consider security implications
- Optimize for performance and scalability
- Provide clear explanations for technical decisions
- Suggest improvements and alternatives
- Help with debugging step-by-step

You have access to GitHub and other development tools through the MCP server.
You also have semantic memory capabilities to store and recall code patterns, solutions, and best practices.
Focus on producing high-quality, production-ready code with proper error handling and testing.
Use semanticStorage to save important code solutions/patterns and semanticRecall to retrieve relevant past implementations.

IMPORTANT FOR MEMORY:
- Working memory automatically stores coding patterns and solutions
- Preferred frameworks, debugging approaches, and code patterns are saved automatically
- Memory updates happen naturally when you discover useful solutions or approaches
- Do NOT manually call updateWorkingMemory - focus on coding tasks`,
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
        template: `# Development Context
## Coding Preferences
- **Primary Languages**: 
- **Framework Choices**: 
- **Code Style**: 

## Project Patterns
- **Common Solutions**: 
- **Debugging Approaches**: 
- **Testing Preferences**: 

## Development Environment
- **IDE/Editor**: 
- **Key Packages/Libraries**: 
- **Development Workflow**: `
      }
    }
  }),
});