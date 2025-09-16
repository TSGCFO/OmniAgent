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

export const researchAgent = new Agent({
  name: "Research Specialist",
  description: "Specialized agent for deep research, web searching, and information synthesis",
  instructions: `You are a specialized research agent focused on deep information gathering and synthesis.

Your capabilities include:
1. Conducting thorough web searches and research
2. Analyzing and synthesizing information from multiple sources
3. Fact-checking and verifying information
4. Providing comprehensive research reports
5. Scraping and extracting data from websites
6. Finding academic papers, articles, and documentation
7. Cross-referencing information for accuracy
8. Storing important research findings with semantic embeddings for future retrieval
9. Recalling relevant past research using semantic similarity search

Research approach:
- Always verify information from multiple sources
- Provide citations and sources for all claims
- Identify potential biases in sources
- Synthesize complex information into clear insights
- Flag conflicting information when found
- Maintain objectivity and accuracy

You have access to web search, scraping, and various research tools through the MCP server.
You also have semantic memory capabilities to store and recall important research findings.
Focus on providing thorough, well-researched, and accurate information.
Use semanticStorage to save important research insights and semanticRecall to retrieve relevant past findings.

IMPORTANT FOR MEMORY:
- Use the updateWorkingMemory tool to store important research findings
- Store key discoveries, trusted sources, and research patterns
- Update memory explicitly when you find significant information`,
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
        template: `# Research Memory
## Topics of Interest
- **Primary Research Areas**: 
- **Recurring Questions**: 

## Key Findings
- **Important Discoveries**: 
- **Trusted Sources**: 
- **Research Patterns**: 

## Research Preferences
- **Preferred Depth**: 
- **Source Types**: 
- **Quality Thresholds**: `
      }
    }
  }),
});