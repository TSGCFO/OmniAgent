import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { unifiedMemory } from "../memory/unified-memory";
import { getMCPTools } from "../mcp-client";
import { researchAgent } from "./refactored/researchAgent";
import { emailAgent } from "./refactored/emailAgent";
import { codingAgent } from "./refactored/codingAgent";
import { personalAssistant } from "./refactored/personalAssistant";
import { researchWorkflow, emailWorkflow, codingWorkflow } from "../network/simplified-workflows";
import { Mastra } from "@mastra/core";
import { z } from "zod";

// Create the main OmniAgent that coordinates all other agents
export const omniAgent = new Agent({
  name: "OmniAgent Coordinator",
  description: "Intelligent coordinator that routes tasks to specialized agents and workflows",
  instructions: `You are the OmniAgent - an advanced AI coordination system that intelligently orchestrates specialized agents to provide comprehensive, intelligent assistance.

## Your Role
You are the central coordinator of a sophisticated multi-agent system designed to handle any task with intelligence, efficiency, and precision. Your primary responsibility is to understand user needs and seamlessly coordinate the most appropriate agents and workflows to deliver exceptional results.

## Available Specialized Agents
You can access these specialized agents through their tools:
- **research_agent**: Deep research, fact-checking, information synthesis, and comprehensive analysis
- **email_agent**: Professional communication, inbox management, email composition, and correspondence handling
- **coding_agent**: Software development, code review, debugging, architecture design, and technical problem-solving
- **personal_assistant**: Life management, scheduling, goal setting, productivity, and personal organization

## Available Workflows  
You can execute these workflows through their tools:
- **research_workflow**: Comprehensive research with analysis and synthesis
- **email_workflow**: Email analysis and response generation
- **coding_workflow**: Code analysis with improvement suggestions

## Decision-Making Framework
1. **Task Analysis**: Understand the complete scope and requirements
2. **Agent Selection**: Choose the most appropriate specialized agent(s) or workflow(s)
3. **Coordination Strategy**: Plan how to use multiple agents if needed
4. **Quality Assurance**: Ensure outputs meet high standards
5. **Memory Integration**: Store important insights for future reference

## How to Use Agents and Workflows
- For simple tasks: Use the appropriate agent tool directly
- For complex tasks: Use workflows or coordinate multiple agents
- For multi-domain tasks: Break down the task and use multiple agents sequentially

Remember: You are the intelligent coordinator. Use your tools wisely to provide the most comprehensive, accurate, and helpful assistance possible.`,
  model: openai("gpt-4o"),
  memory: unifiedMemory,
  workflows: {
    researchWorkflow,
    emailWorkflow,
    codingWorkflow,
  },
  tools: async () => {
    try {
      const mcpTools = await getMCPTools();
      return {
        ...mcpTools,
        // Agent tools
        research_agent: {
          id: "research_agent",
          description: "Use the research specialist for deep information gathering and analysis",
          inputSchema: z.object({
            query: z.string().describe("The research query or topic")
          }),
          execute: async ({ context }: { context: { query: string } }) => {
            const result = await researchAgent.generate(context.query, {
              memory: {
                resource: "omni-agent",
                thread: `research-${Date.now()}`,
              },
            });
            return { result: result.text };
          },
        },
        email_agent: {
          id: "email_agent",
          description: "Use the email manager for professional communication tasks",
          inputSchema: z.object({
            task: z.string().describe("The email-related task")
          }),
          execute: async ({ context }: { context: { task: string } }) => {
            const result = await emailAgent.generate(context.task, {
              memory: {
                resource: "omni-agent",
                thread: `email-${Date.now()}`,
              },
            });
            return { result: result.text };
          },
        },
        coding_agent: {
          id: "coding_agent",
          description: "Use the coding assistant for software development tasks",
          inputSchema: z.object({
            task: z.string().describe("The coding task or question")
          }),
          execute: async ({ context }: { context: { task: string } }) => {
            const result = await codingAgent.generate(context.task, {
              memory: {
                resource: "omni-agent",
                thread: `coding-${Date.now()}`,
              },
            });
            return { result: result.text };
          },
        },
        personal_assistant_agent: {
          id: "personal_assistant_agent",
          description: "Use the personal assistant for life management and productivity",
          inputSchema: z.object({
            task: z.string().describe("The personal assistance task")
          }),
          execute: async ({ context }: { context: { task: string } }) => {
            const result = await personalAssistant.generate(context.task, {
              memory: {
                resource: "omni-agent",
                thread: `personal-${Date.now()}`,
              },
            });
            return { result: result.text };
          },
        },
        // Workflow tools
        research_workflow: {
          id: "research_workflow",
          description: "Execute comprehensive research workflow with analysis and synthesis",
          inputSchema: z.object({
            topic: z.string().describe("Research topic"),
            depth: z.enum(["basic", "comprehensive", "exhaustive"]).default("comprehensive").describe("Research depth"),
            focus: z.string().optional().describe("Specific focus area (optional)")
          }),
          execute: async ({ context, mastra }: { context: { topic: string; depth?: string; focus?: string }; mastra?: Mastra }) => {
            const workflow = mastra?.getWorkflow("researchWorkflow");
            if (!workflow) throw new Error("Research workflow not found");
            
            const run = await workflow.createRunAsync();
            const result = await run.start({
              inputData: {
                topic: context.topic,
                depth: context.depth || "comprehensive",
                focus: context.focus,
              }
            });
            
            return result.status === "success" ? result.result : { error: "Workflow failed" };
          },
        },
        email_workflow: {
          id: "email_workflow",
          description: "Execute email workflow for analysis and response generation",
          inputSchema: z.object({
            emailContent: z.string().describe("Email content to analyze"),
            sender: z.string().optional().describe("Email sender (optional)"),
            context: z.string().optional().describe("Additional context (optional)"),
            action: z.enum(["analyze", "respond", "organize"]).default("analyze").describe("Action to perform")
          }),
          execute: async ({ context, mastra }: { context: { emailContent: string; sender?: string; context?: string; action?: string }; mastra?: Mastra }) => {
            const workflow = mastra?.getWorkflow("emailWorkflow");
            if (!workflow) throw new Error("Email workflow not found");
            
            const run = await workflow.createRunAsync();
            const result = await run.start({
              inputData: {
                emailContent: context.emailContent,
                sender: context.sender,
                context: context.context,
                action: context.action || "analyze",
              }
            });
            
            return result.status === "success" ? result.result : { error: "Workflow failed" };
          },
        },
        coding_workflow: {
          id: "coding_workflow",
          description: "Execute coding workflow for analysis and improvements",
          inputSchema: z.object({
            code: z.string().describe("Code to analyze"),
            language: z.string().describe("Programming language"),
            context: z.string().optional().describe("Additional context (optional)"),
            action: z.enum(["analyze", "review", "optimize", "debug"]).default("analyze").describe("Action to perform")
          }),
          execute: async ({ context, mastra }: { context: { code: string; language: string; context?: string; action?: string }; mastra?: Mastra }) => {
            const workflow = mastra?.getWorkflow("codingWorkflow");
            if (!workflow) throw new Error("Coding workflow not found");
            
            const run = await workflow.createRunAsync();
            const result = await run.start({
              inputData: {
                code: context.code,
                language: context.language,
                context: context.context || "",
                action: context.action || "analyze",
              }
            });
            
            return result.status === "success" ? result.result : { error: "Workflow failed" };
          },
        },
      };
    } catch (error) {
      console.error('Failed to load tools:', error);
      return {};
    }
  },
});
