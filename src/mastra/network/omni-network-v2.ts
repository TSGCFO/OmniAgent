import { NewAgentNetwork } from '@mastra/core/network/vNext';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { unifiedMemory } from '../memory/unified-memory';
import { getMCPTools } from '../mcp-client';
import { researchAgent } from '../agents/refactored/researchAgent';
import { emailAgent } from '../agents/refactored/emailAgent';
import { codingAgent } from '../agents/refactored/codingAgent';
import { personalAssistant } from '../agents/refactored/personalAssistant';
import { semanticStorage } from '../tools/refactored/semanticStorage';
import { semanticRecall } from '../tools/refactored/semanticRecall';
import { webScraper } from '../tools/webScraper';
import { deepResearch } from '../tools/deepResearch';
import { selfLearning } from '../tools/selfLearning';

const openaiClient = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL || undefined,
  apiKey: process.env.OPENAI_API_KEY,
});

// Advanced Research Workflow with Multi-Agent Coordination
const researchAnalysisStep = createStep({
  id: 'research-analysis',
  description: 'Analyzes research requirements and determines the best approach',
  inputSchema: z.object({
    topic: z.string(),
    depth: z.enum(['basic', 'comprehensive', 'exhaustive']).default('comprehensive'),
    focus: z.string().optional(),
    requirements: z.object({
      format: z.string().default('comprehensive report'),
      audience: z.string().default('general'),
      length: z.string().default('detailed'),
    }).optional(),
  }),
  outputSchema: z.object({
    researchPlan: z.object({
      approach: z.string(),
      sources: z.array(z.string()),
      timeline: z.string(),
      deliverables: z.array(z.string()),
    }),
    agentRecommendations: z.array(z.string()),
    topic: z.string(),
    requirements: z.object({
      format: z.string(),
      audience: z.string(),
      length: z.string(),
    }).optional(),
  }),
  execute: async ({ inputData }) => {
    const result = await researchAgent.generate(
      `Create a comprehensive research plan for: ${inputData.topic}
      
      Depth: ${inputData.depth}
      Focus: ${inputData.focus || 'General overview'}
      
      Provide a detailed research plan including approach, sources, timeline, and deliverables.`,
      {
        output: z.object({
          researchPlan: z.object({
            approach: z.string(),
            sources: z.array(z.string()),
            timeline: z.string(),
            deliverables: z.array(z.string()),
          }),
          agentRecommendations: z.array(z.string()),
        }),
        maxSteps: 3,
      }
    );
    
    return { 
      ...result.object, 
      topic: inputData.topic,
      requirements: inputData.requirements 
    };
  },
});

const factCheckStep = createStep({
  id: 'fact-check',
  description: 'Verifies and fact-checks research findings',
  inputSchema: z.object({
    researchPlan: z.object({
      approach: z.string(),
      sources: z.array(z.string()),
      timeline: z.string(),
      deliverables: z.array(z.string()),
    }),
    agentRecommendations: z.array(z.string()),
    topic: z.string(),
    requirements: z.object({
      format: z.string(),
      audience: z.string(),
      length: z.string(),
    }).optional(),
  }),
  outputSchema: z.object({
    verifiedFindings: z.string(),
    factCheckResults: z.array(z.object({
      claim: z.string(),
      verified: z.boolean(),
      confidence: z.number(),
      sources: z.array(z.string()),
    })),
    reliabilityScore: z.number(),
    topic: z.string(),
    requirements: z.object({
      format: z.string(),
      audience: z.string(),
      length: z.string(),
    }).optional(),
  }),
  execute: async ({ inputData }) => {
    const result = await researchAgent.generate(
      `Based on the research plan for topic: ${inputData.topic}
      
      Research approach: ${inputData.researchPlan.approach}
      Planned sources: ${inputData.researchPlan.sources.join(', ')}
      
      Please conduct the research according to this plan and provide fact-checked findings with confidence scores.
      Focus on verifying claims and ensuring accuracy of information.`,
      {
        output: z.object({
          verifiedFindings: z.string(),
          factCheckResults: z.array(z.object({
            claim: z.string(),
            verified: z.boolean(),
            confidence: z.number(),
            sources: z.array(z.string()),
          })),
          reliabilityScore: z.number(),
        }),
        maxSteps: 3,
      }
    );
    
    return { 
      ...result.object, 
      topic: inputData.topic,
      requirements: inputData.requirements 
    };
  },
});

const synthesisStep = createStep({
  id: 'synthesis',
  description: 'Synthesizes research findings into a comprehensive report',
  inputSchema: z.object({
    verifiedFindings: z.string(),
    factCheckResults: z.array(z.object({
      claim: z.string(),
      verified: z.boolean(),
      confidence: z.number(),
      sources: z.array(z.string()),
    })),
    reliabilityScore: z.number(),
    topic: z.string(),
    requirements: z.object({
      format: z.string(),
      audience: z.string(),
      length: z.string(),
    }).optional(),
  }),
  outputSchema: z.object({
    report: z.string(),
    summary: z.string(),
    keyInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
    sources: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const result = await researchAgent.generate(
      `Synthesize these verified findings into a comprehensive report: ${inputData.verifiedFindings}
      
      Topic: ${inputData.topic}
      Format: ${inputData.requirements?.format || 'comprehensive report'}
      Audience: ${inputData.requirements?.audience || 'general'}
      Length: ${inputData.requirements?.length || 'detailed'}
      
      Create a well-structured report with summary, insights, and recommendations.`,
      {
        output: z.object({
          report: z.string(),
          summary: z.string(),
          keyInsights: z.array(z.string()),
          recommendations: z.array(z.string()),
          sources: z.array(z.string()),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

// Advanced Email Management Workflow
const emailAnalysisStep = createStep({
  id: 'email-analysis',
  description: 'Analyzes email content, context, and determines appropriate response strategy',
  inputSchema: z.object({
    emailContent: z.string(),
    sender: z.string().optional(),
    context: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    action: z.enum(['analyze', 'respond', 'organize', 'schedule']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.object({
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.string(),
      sentiment: z.string(),
      actionRequired: z.boolean(),
      suggestedTone: z.string(),
      keyPoints: z.array(z.string()),
    }),
    responseStrategy: z.object({
      approach: z.string(),
      timeline: z.string(),
      stakeholders: z.array(z.string()),
    }),
  }),
  execute: async ({ inputData }) => {
    const result = await emailAgent.generate(
      `Analyze this email and provide a comprehensive analysis: ${inputData.emailContent}
      
      Sender: ${inputData.sender || 'Unknown'}
      Context: ${inputData.context || 'No additional context'}
      Urgency: ${inputData.urgency || 'Unknown'}
      
      Provide detailed analysis and response strategy.`,
      {
        output: z.object({
          analysis: z.object({
            priority: z.enum(['low', 'medium', 'high', 'urgent']),
            category: z.string(),
            sentiment: z.string(),
            actionRequired: z.boolean(),
            suggestedTone: z.string(),
            keyPoints: z.array(z.string()),
          }),
          responseStrategy: z.object({
            approach: z.string(),
            timeline: z.string(),
            stakeholders: z.array(z.string()),
          }),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

// Advanced Coding Workflow
const codeAnalysisStep = createStep({
  id: 'code-analysis',
  description: 'Comprehensive code analysis including quality, security, and performance assessment',
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional(),
    requirements: z.object({
      focus: z.array(z.string()).optional(),
      standards: z.array(z.string()).optional(),
    }).optional(),
    action: z.enum(['analyze', 'review', 'optimize', 'debug', 'refactor']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.object({
      quality: z.enum(['poor', 'fair', 'good', 'excellent']),
      security: z.enum(['vulnerable', 'moderate', 'secure', 'very-secure']),
      performance: z.enum(['poor', 'fair', 'good', 'excellent']),
      maintainability: z.enum(['poor', 'fair', 'good', 'excellent']),
      issues: z.array(z.object({
        type: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        suggestion: z.string(),
        line: z.number().optional(),
      })),
    }),
    improvements: z.array(z.string()),
    bestPractices: z.array(z.string()),
  }),
  execute: async ({ inputData }) => {
    const result = await codingAgent.generate(
      `Analyze this ${inputData.language} code comprehensively: ${inputData.code}
      
      Context: ${inputData.context || 'No additional context'}
      Focus areas: ${inputData.requirements?.focus?.join(', ') || 'General analysis'}
      Standards: ${inputData.requirements?.standards?.join(', ') || 'Industry standard'}
      
      Provide detailed analysis including quality, security, performance, and maintainability.`,
      {
        output: z.object({
          analysis: z.object({
            quality: z.enum(['poor', 'fair', 'good', 'excellent']),
            security: z.enum(['vulnerable', 'moderate', 'secure', 'very-secure']),
            performance: z.enum(['poor', 'fair', 'good', 'excellent']),
            maintainability: z.enum(['poor', 'fair', 'good', 'excellent']),
            issues: z.array(z.object({
              type: z.string(),
              severity: z.enum(['low', 'medium', 'high', 'critical']),
              description: z.string(),
              suggestion: z.string(),
              line: z.number().optional(),
            })),
          }),
          improvements: z.array(z.string()),
          bestPractices: z.array(z.string()),
        }),
        maxSteps: 3,
      }
    );
    
    return result.object;
  },
});

// Create comprehensive workflows
export const advancedResearchWorkflow = createWorkflow({
  id: 'advanced-research-workflow',
  description: 'Comprehensive research workflow with analysis, fact-checking, and synthesis',
  inputSchema: z.object({
    topic: z.string(),
    depth: z.enum(['basic', 'comprehensive', 'exhaustive']).default('comprehensive'),
    focus: z.string().optional(),
    requirements: z.object({
      format: z.string().default('comprehensive report'),
      audience: z.string().default('general'),
      length: z.string().default('detailed'),
    }).optional(),
  }),
  outputSchema: z.object({
    report: z.string(),
    summary: z.string(),
    keyInsights: z.array(z.string()),
    recommendations: z.array(z.string()),
    sources: z.array(z.string()),
    reliabilityScore: z.number(),
  }),
})
  .then(researchAnalysisStep)
  .then(factCheckStep)
  .then(synthesisStep)
  .commit();

export const advancedEmailWorkflow = createWorkflow({
  id: 'advanced-email-workflow',
  description: 'Comprehensive email management workflow with analysis and response generation',
  inputSchema: z.object({
    emailContent: z.string(),
    sender: z.string().optional(),
    context: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    action: z.enum(['analyze', 'respond', 'organize', 'schedule']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.object({
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.string(),
      sentiment: z.string(),
      actionRequired: z.boolean(),
      suggestedTone: z.string(),
      keyPoints: z.array(z.string()),
    }),
    responseStrategy: z.object({
      approach: z.string(),
      timeline: z.string(),
      stakeholders: z.array(z.string()),
    }),
    response: z.string().optional(),
  }),
})
  .then(emailAnalysisStep)
  .commit();

export const advancedCodingWorkflow = createWorkflow({
  id: 'advanced-coding-workflow',
  description: 'Comprehensive coding assistance workflow with analysis and improvement suggestions',
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional(),
    requirements: z.object({
      focus: z.array(z.string()).optional(),
      standards: z.array(z.string()).optional(),
    }).optional(),
    action: z.enum(['analyze', 'review', 'optimize', 'debug', 'refactor']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.object({
      quality: z.enum(['poor', 'fair', 'good', 'excellent']),
      security: z.enum(['vulnerable', 'moderate', 'secure', 'very-secure']),
      performance: z.enum(['poor', 'fair', 'good', 'excellent']),
      maintainability: z.enum(['poor', 'fair', 'good', 'excellent']),
      issues: z.array(z.object({
        type: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        suggestion: z.string(),
        line: z.number().optional(),
      })),
    }),
    improvements: z.array(z.string()),
    bestPractices: z.array(z.string()),
    improvedCode: z.string().optional(),
    explanation: z.string().optional(),
  }),
})
  .then(codeAnalysisStep)
  .commit();

// Create the comprehensive OmniAgent Network v2
export const omniNetworkV2 = new NewAgentNetwork({
  id: 'omni-network-v2',
  name: 'OmniAgent Network v2',
  instructions: `You are the OmniAgent Network v2 - an advanced AI coordination system that intelligently orchestrates specialized agents to provide comprehensive, intelligent assistance.

## Your Role
You are the central coordinator of a sophisticated multi-agent system designed to handle any task with intelligence, efficiency, and precision. Your primary responsibility is to understand user needs and seamlessly coordinate the most appropriate agents and workflows to deliver exceptional results.

## Available Specialized Agents
- **Research Specialist**: Deep research, fact-checking, information synthesis, and comprehensive analysis
- **Email Manager**: Professional communication, inbox management, email composition, and correspondence handling
- **Coding Assistant**: Software development, code review, debugging, architecture design, and technical problem-solving
- **Personal Assistant**: Life management, scheduling, goal setting, productivity, and personal organization

## Available Advanced Workflows
- **Advanced Research Workflow**: Multi-step research with analysis, fact-checking, and synthesis
- **Advanced Email Workflow**: Comprehensive email analysis and response generation
- **Advanced Coding Workflow**: Complete code analysis with security, performance, and quality assessment

## Core Capabilities
- **Intelligent Routing**: Automatically determine the best agent(s) or workflow(s) for each task
- **Multi-Agent Coordination**: Seamlessly coordinate multiple agents for complex tasks
- **Context Awareness**: Maintain comprehensive context across all interactions
- **Memory Integration**: Leverage shared memory for personalized and consistent assistance
- **Tool Integration**: Access 500+ integrations through MCP server and custom tools
- **Quality Assurance**: Ensure high-quality outputs through systematic verification

## Decision-Making Framework
1. **Task Analysis**: Understand the complete scope and requirements
2. **Agent Selection**: Choose the most appropriate specialized agent(s)
3. **Workflow Determination**: Decide whether to use simple agent calls or complex workflows
4. **Coordination Strategy**: Plan how multiple agents will collaborate if needed
5. **Quality Assurance**: Ensure outputs meet high standards
6. **Memory Integration**: Store important insights for future reference

## Specialized Task Handling
- **Research Tasks**: Use Research Specialist or Advanced Research Workflow for comprehensive analysis
- **Communication Tasks**: Use Email Manager or Advanced Email Workflow for professional correspondence
- **Technical Tasks**: Use Coding Assistant or Advanced Coding Workflow for development work
- **Personal Tasks**: Use Personal Assistant for life management and organization
- **Complex Multi-Domain Tasks**: Coordinate multiple agents and workflows as needed

## Quality Standards
- **Accuracy**: Ensure all information is accurate and well-sourced
- **Completeness**: Address all aspects of the user's request
- **Clarity**: Present information in clear, accessible formats
- **Efficiency**: Optimize for both speed and quality
- **Personalization**: Adapt responses to user preferences and context
- **Consistency**: Maintain consistent quality across all interactions

## Memory and Learning
- **Shared Memory**: All agents share context through the unified memory system
- **Learning**: Continuously improve based on user feedback and interactions
- **Personalization**: Adapt to user preferences, patterns, and goals
- **Context Preservation**: Maintain conversation context across sessions

## Network Collaboration
- **Seamless Handoffs**: Smoothly transfer tasks between agents when appropriate
- **Context Sharing**: Maintain context when multiple agents are involved
- **Result Synthesis**: Combine outputs from multiple agents into coherent responses
- **Quality Coordination**: Ensure consistent quality across all agent outputs

Remember: You are the intelligent coordinator of a powerful multi-agent system. Your goal is to provide the most comprehensive, accurate, and helpful assistance possible by leveraging the specialized capabilities of your agent network while maintaining seamless user experience.`,
  model: openaiClient('gpt-4o'),
  agents: {
    researchAgent,
    emailAgent,
    codingAgent,
    personalAssistant,
  },
  workflows: {
    advancedResearchWorkflow,
    advancedEmailWorkflow,
    advancedCodingWorkflow,
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
  memory: unifiedMemory,
});
