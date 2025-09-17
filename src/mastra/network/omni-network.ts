import { NewAgentNetwork } from '@mastra/core/network/vNext';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';
import { getMCPTools } from '../mcp-client';
import { researchAgent } from '../agents/researchAgent';
import { emailAgent } from '../agents/emailAgent';
import { codingAgent } from '../agents/codingAgent';
import { personalAssistant } from '../agents/personalAssistant';
import { semanticStorage } from '../tools/semanticStorage';
import { semanticRecall } from '../tools/semanticRecall';
import { webScraper } from '../tools/webScraper';
import { deepResearch } from '../tools/deepResearch';
import { selfLearning } from '../tools/selfLearning';

const openaiClient = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Shared memory for the network
const sharedMemory = new Memory({
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!
  }),
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL!
  }),
  embedder: openaiClient.embedding("text-embedding-3-small"),
  options: {
    threads: {
      generateTitle: true
    },
    lastMessages: 20,
    semanticRecall: {
      topK: 5,
      messageRange: 3
    },
    workingMemory: {
      enabled: true,
      scope: 'resource',
      template: `# OmniAgent Network Memory
## User Profile
- **Name**: 
- **Role/Title**: 
- **Primary Goals**: 

## Preferences
- **Communication Style**: 
- **Working Hours**: 
- **Response Detail Level**: 

## Current Context
- **Active Projects**: 
- **Current Focus**: 
- **Important Deadlines**: 

## Technical Environment
- **Tech Stack**: 
- **Tools & Services**: 
- **API Keys/Integrations Available**: 

## Agent Usage Patterns
- **Research Requests**: 
- **Email Tasks**: 
- **Coding Tasks**: 
- **Personal Tasks**: 

## Notes & Reminders
- **Important Notes**: 
- **Follow-ups Needed**: `
    }
  }
});

// Create workflows for complex multi-agent tasks
const researchStep = createStep({
  id: 'research-step',
  description: 'Conducts deep research on a given topic using the research agent',
  inputSchema: z.object({
    topic: z.string().describe('The topic to research'),
    depth: z.enum(['basic', 'comprehensive', 'exhaustive']).default('comprehensive'),
  }),
  outputSchema: z.object({
    findings: z.string(),
    sources: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  execute: async ({ inputData }) => {
    const result = await researchAgent.generate(
      `Research the following topic in ${inputData.depth} detail: ${inputData.topic}`,
      {
        output: z.object({
          findings: z.string(),
          sources: z.array(z.string()),
          confidence: z.number().min(0).max(1),
        }),
        maxSteps: 5,
      }
    );
    
    return result.object;
  },
});

const factCheckStep = createStep({
  id: 'fact-check-step',
  description: 'Verifies and fact-checks research findings',
  inputSchema: z.object({
    findings: z.string(),
    sources: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),
  outputSchema: z.object({
    verifiedFindings: z.string(),
    factCheckResults: z.array(z.object({
      claim: z.string(),
      verified: z.boolean(),
      confidence: z.number(),
    })),
  }),
  execute: async ({ inputData }) => {
    const result = await researchAgent.generate(
      `Fact-check the following research findings: ${inputData.findings}\n\nSources: ${inputData.sources.join(', ')}`,
      {
        output: z.object({
          verifiedFindings: z.string(),
          factCheckResults: z.array(z.object({
            claim: z.string(),
            verified: z.boolean(),
            confidence: z.number(),
          })),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

const synthesisStep = createStep({
  id: 'synthesis-step',
  description: 'Synthesizes research findings into a comprehensive report',
  inputSchema: z.object({
    verifiedFindings: z.string(),
    factCheckResults: z.array(z.object({
      claim: z.string(),
      verified: z.boolean(),
      confidence: z.number(),
    })),
  }),
  outputSchema: z.object({
    report: z.string(),
    summary: z.string(),
    keyInsights: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const result = await researchAgent.generate(
      `Synthesize these verified findings into a comprehensive report: ${inputData.verifiedFindings}`,
      {
        output: z.object({
          report: z.string(),
          summary: z.string(),
          keyInsights: z.array(z.string()),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

// Deep research workflow
export const deepResearchWorkflow = createWorkflow({
  id: 'deep-research-workflow',
  description: 'Performs comprehensive research with fact-checking and synthesis',
  inputSchema: z.object({
    topic: z.string(),
    depth: z.enum(['basic', 'comprehensive', 'exhaustive']).default('comprehensive'),
  }),
  outputSchema: z.object({
    report: z.string(),
    summary: z.string(),
    keyInsights: z.array(z.string()),
    sources: z.array(z.string()),
  }),
})
  .then(researchStep)
  .then(factCheckStep)
  .then(synthesisStep)
  .commit();

// Email management workflow
const emailAnalysisStep = createStep({
  id: 'email-analysis-step',
  description: 'Analyzes email content and context',
  inputSchema: z.object({
    emailContent: z.string(),
    context: z.string().optional(),
  }),
  outputSchema: z.object({
    analysis: z.object({
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.string(),
      actionRequired: z.boolean(),
      suggestedResponse: z.string().optional(),
    }),
  }),
  execute: async ({ inputData }) => {
    const result = await emailAgent.generate(
      `Analyze this email: ${inputData.emailContent}\n\nContext: ${inputData.context || 'No additional context'}`,
      {
        output: z.object({
          analysis: z.object({
            priority: z.enum(['low', 'medium', 'high', 'urgent']),
            category: z.string(),
            actionRequired: z.boolean(),
            suggestedResponse: z.string().optional(),
          }),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

export const emailManagementWorkflow = createWorkflow({
  id: 'email-management-workflow',
  description: 'Comprehensive email management and response generation',
  inputSchema: z.object({
    emailContent: z.string(),
    context: z.string().optional(),
    action: z.enum(['analyze', 'respond', 'organize']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.object({
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.string(),
      actionRequired: z.boolean(),
      suggestedResponse: z.string().optional(),
    }),
    response: z.string().optional(),
  }),
})
  .then(emailAnalysisStep)
  .commit();

// Coding assistance workflow
const codeAnalysisStep = createStep({
  id: 'code-analysis-step',
  description: 'Analyzes code and provides technical insights',
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional(),
  }),
  outputSchema: z.object({
    analysis: z.object({
      quality: z.enum(['poor', 'fair', 'good', 'excellent']),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
      complexity: z.number(),
    }),
  }),
  execute: async ({ inputData }) => {
    const result = await codingAgent.generate(
      `Analyze this ${inputData.language} code: ${inputData.code}\n\nContext: ${inputData.context || 'No additional context'}`,
      {
        output: z.object({
          analysis: z.object({
            quality: z.enum(['poor', 'fair', 'good', 'excellent']),
            issues: z.array(z.string()),
            suggestions: z.array(z.string()),
            complexity: z.number(),
          }),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

export const codingAssistanceWorkflow = createWorkflow({
  id: 'coding-assistance-workflow',
  description: 'Comprehensive coding assistance and code review',
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional(),
    task: z.enum(['analyze', 'review', 'optimize', 'debug']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.object({
      quality: z.enum(['poor', 'fair', 'good', 'excellent']),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
      complexity: z.number(),
    }),
    improvedCode: z.string().optional(),
    explanation: z.string().optional(),
  }),
})
  .then(codeAnalysisStep)
  .commit();

// Create the main OmniAgent Network
export const omniNetwork = new NewAgentNetwork({
  id: 'omni-network',
  name: 'OmniAgent Network',
  instructions: `You are the OmniAgent Network - a comprehensive AI assistant system that coordinates specialized agents to provide intelligent, thorough assistance for any task.

Your role is to:
1. **Understand user needs** and determine the best approach for each request
2. **Route tasks intelligently** to the most appropriate specialized agents or workflows
3. **Coordinate multi-agent collaboration** when complex tasks require multiple capabilities
4. **Synthesize responses** from multiple agents into coherent, comprehensive answers
5. **Learn and adapt** from interactions to improve future responses

Available specialized agents:
- **Research Agent**: Deep research, web searches, fact-checking, information synthesis
- **Email Agent**: Email management, composition, organization, priority analysis
- **Coding Agent**: Programming assistance, code reviews, technical problem-solving
- **Personal Assistant**: Scheduling, reminders, personal organization, life advice

Available workflows:
- **Deep Research Workflow**: Comprehensive research with fact-checking and synthesis
- **Email Management Workflow**: Complete email analysis and response generation
- **Coding Assistance Workflow**: Code analysis, review, and improvement

Available capabilities through MCP server:
- Access to 500+ app integrations (Gmail, GitHub, Outlook, Slack, etc.)
- Web scraping and data extraction
- File management and organization
- Database operations
- Social media management
- Cloud services integration
- And many more through the rube.app MCP server

Decision-making approach:
- For simple, single-domain tasks: Use the appropriate specialized agent directly
- For complex, multi-domain tasks: Use workflows that coordinate multiple agents
- For research-heavy tasks: Use the deep research workflow for thorough analysis
- For email tasks: Use the email management workflow for comprehensive handling
- For coding tasks: Use the coding assistance workflow for technical excellence
- For personal tasks: Use the personal assistant for scheduling and organization

Always:
- Be proactive in offering comprehensive assistance
- Provide well-researched, accurate information
- Learn from user preferences and adapt accordingly
- Maintain conversation context across interactions
- Use the most appropriate tool for each specific task
- Coordinate multiple agents when needed for complex requests

Remember: You have access to extensive tools and capabilities. Use them wisely to provide the most comprehensive and helpful assistance possible.`,
  model: openaiClient('gpt-4o'),
  agents: {
    researchAgent,
    emailAgent,
    codingAgent,
    personalAssistant,
  },
  workflows: {
    deepResearchWorkflow,
    emailManagementWorkflow,
    codingAssistanceWorkflow,
  },
  tools: async () => {
    try {
      const mcpTools = await getMCPTools();
      return {
        ...mcpTools,
        semanticStorage,
        semanticRecall,
        webScraper,
        deepResearch,
        selfLearning,
      };
    } catch (error) {
      console.error('Failed to load MCP tools:', error);
      return {
        semanticStorage,
        semanticRecall,
        webScraper,
        deepResearch,
        selfLearning,
      };
    }
  },
  memory: sharedMemory,
});
