import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { researchAgent } from '../agents/refactored/researchAgent';
import { emailAgent } from '../agents/refactored/emailAgent';
import { codingAgent } from '../agents/refactored/codingAgent';

// Simplified Research Workflow
export const researchWorkflow = createWorkflow({
  id: 'research-workflow',
  description: 'Comprehensive research workflow with analysis and synthesis',
  inputSchema: z.object({
    topic: z.string(),
    depth: z.enum(['basic', 'comprehensive', 'exhaustive']).default('comprehensive'),
    focus: z.string().optional(),
  }),
  outputSchema: z.object({
    report: z.string(),
    summary: z.string(),
    keyInsights: z.array(z.string()),
    sources: z.array(z.string()),
  }),
})
  .then(createStep({
    id: 'research-step',
    description: 'Conducts comprehensive research on the given topic',
    inputSchema: z.object({
      topic: z.string(),
      depth: z.enum(['basic', 'comprehensive', 'exhaustive']),
      focus: z.string().optional(),
    }),
    outputSchema: z.object({
      report: z.string(),
      summary: z.string(),
      keyInsights: z.array(z.string()),
      sources: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
      const result = await researchAgent.generate(
        `Conduct comprehensive research on: ${inputData.topic}
        
        Depth: ${inputData.depth}
        Focus: ${inputData.focus || 'General overview'}
        
        Provide a detailed research report with summary, key insights, and sources.`,
        {
          output: z.object({
            report: z.string(),
            summary: z.string(),
            keyInsights: z.array(z.string()),
            sources: z.array(z.string()),
          }),
          maxSteps: 5,
        }
      );
      
      return result.object;
    },
  }))
  .commit();

// Simplified Email Workflow
export const emailWorkflow = createWorkflow({
  id: 'email-workflow',
  description: 'Email management workflow with analysis and response generation',
  inputSchema: z.object({
    emailContent: z.string(),
    sender: z.string().optional(),
    context: z.string().optional(),
    action: z.enum(['analyze', 'respond', 'organize']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    response: z.string().optional(),
    recommendations: z.array(z.string()),
  }),
})
  .then(createStep({
    id: 'email-step',
    description: 'Analyzes email and provides appropriate response',
    inputSchema: z.object({
      emailContent: z.string(),
      sender: z.string().optional(),
      context: z.string().optional(),
      action: z.enum(['analyze', 'respond', 'organize']),
    }),
    outputSchema: z.object({
      analysis: z.string(),
      response: z.string().optional(),
      recommendations: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
      const result = await emailAgent.generate(
        `Analyze this email and provide ${inputData.action}: ${inputData.emailContent}
        
        Sender: ${inputData.sender || 'Unknown'}
        Context: ${inputData.context || 'No additional context'}
        
        Provide analysis and ${inputData.action === 'respond' ? 'a response' : 'recommendations'}.`,
        {
          output: z.object({
            analysis: z.string(),
            response: z.string().optional(),
            recommendations: z.array(z.string()),
          }),
          maxSteps: 5,
        }
      );
      
      return result.object;
    },
  }))
  .commit();

// Simplified Coding Workflow
export const codingWorkflow = createWorkflow({
  id: 'coding-workflow',
  description: 'Coding assistance workflow with analysis and improvement suggestions',
  inputSchema: z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional(),
    action: z.enum(['analyze', 'review', 'optimize', 'debug']).default('analyze'),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    improvedCode: z.string().optional(),
    recommendations: z.array(z.string()),
    issues: z.array(z.string()),
  }),
})
  .then(createStep({
    id: 'coding-step',
    description: 'Analyzes code and provides improvements',
    inputSchema: z.object({
      code: z.string(),
      language: z.string(),
      context: z.string().optional(),
      action: z.enum(['analyze', 'review', 'optimize', 'debug']),
    }),
    outputSchema: z.object({
      analysis: z.string(),
      improvedCode: z.string().optional(),
      recommendations: z.array(z.string()),
      issues: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
      const result = await codingAgent.generate(
        `Analyze this ${inputData.language} code and provide ${inputData.action}: ${inputData.code}
        
        Context: ${inputData.context || 'No additional context'}
        
        Provide analysis, ${inputData.action === 'optimize' ? 'improved code' : 'recommendations'}, and identify any issues.`,
        {
          output: z.object({
            analysis: z.string(),
            improvedCode: z.string().optional(),
            recommendations: z.array(z.string()),
            issues: z.array(z.string()),
          }),
          maxSteps: 5,
        }
      );
      
      return result.object;
    },
  }))
  .commit();
