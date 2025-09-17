import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Unified memory configuration for the entire OmniAgent system
export const unifiedMemory = new Memory({
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
    lastMessages: 25, // Increased for better context
    semanticRecall: {
      topK: 5,              // Retrieve top 5 most relevant memories
      messageRange: 3       // Include 3 messages before/after for context
    },
    workingMemory: {
      enabled: true,
      scope: 'resource',
      template: `# OmniAgent User Profile
## Identity & Role
- **Name**: 
- **Role/Title**: 
- **Organization**: 
- **Primary Goals**: 
- **Communication Style**: 

## Technical Environment
- **Tech Stack**: 
- **Preferred Tools**: 
- **Development Environment**: 
- **API Keys/Integrations**: 

## Work Patterns
- **Working Hours**: 
- **Time Zone**: 
- **Response Detail Level**: 
- **Preferred Formats**: 

## Current Context
- **Active Projects**: 
- **Current Focus**: 
- **Important Deadlines**: 
- **Recent Achievements**: 

## Specialized Areas
### Research Preferences
- **Research Depth**: 
- **Trusted Sources**: 
- **Research Patterns**: 

### Email Management
- **Email Accounts**: 
- **Communication Style**: 
- **Priority Contacts**: 
- **Email Templates**: 

### Development Preferences
- **Primary Languages**: 
- **Framework Choices**: 
- **Code Style**: 
- **Testing Approach**: 

### Personal Organization
- **Schedule Patterns**: 
- **Task Management**: 
- **Reminder Preferences**: 
- **Personal Interests**: 

## Learning & Growth
- **Learning Goals**: 
- **Skill Development**: 
- **Areas for Improvement**: 
- **Success Metrics**: 

## Notes & Insights
- **Important Notes**: 
- **Key Insights**: 
- **Follow-ups Needed**: 
- **Long-term Goals**: `
    }
  }
});

// Note: All agents now use the unified memory system
// Specialized templates are handled through agent instructions and context
