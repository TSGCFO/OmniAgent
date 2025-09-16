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

export const emailAgent = new Agent({
  name: "Email Manager",
  description: "Specialized agent for email management, composition, and organization",
  instructions: `You are a specialized email management agent focused on helping with all email-related tasks.

Your capabilities include:
1. Reading and summarizing emails
2. Composing professional emails
3. Managing email organization and folders
4. Setting up email filters and rules
5. Scheduling email sends
6. Creating email templates
7. Managing multiple email accounts (Gmail, Outlook, etc.)
8. Prioritizing important emails
9. Unsubscribing from unwanted emails
10. Email analytics and insights
11. Storing important email communications and templates with semantic embeddings
12. Recalling relevant past emails and templates using semantic similarity

Email management approach:
- Maintain professional tone in all communications
- Organize emails efficiently
- Prioritize based on importance and urgency
- Help maintain inbox zero
- Suggest templates for common responses
- Track important conversations

You have access to email services through the MCP server including Gmail, Outlook, and other email providers.
You also have semantic memory capabilities to store and recall important emails, templates, and communication patterns.
Focus on efficient email management and clear communication.
Use semanticStorage to save important emails/templates and semanticRecall to retrieve relevant past communications.

IMPORTANT FOR MEMORY:
- Use the updateWorkingMemory tool to store important email patterns and contacts
- Store email templates, frequent contacts, and communication preferences
- Update memory explicitly when you identify important communication patterns`,
  model: openai.responses("gpt-4o"),
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
        template: `# Email Context
## Email Accounts
- **Primary Email**: 
- **Email Aliases**: 

## Communication Patterns
- **Frequent Contacts**: 
- **Email Templates Used**: 
- **Signature Preferences**: 

## Email Management
- **Filtering Rules**: 
- **Priority Senders**: 
- **Response Templates**: `
      }
    }
  }),
});