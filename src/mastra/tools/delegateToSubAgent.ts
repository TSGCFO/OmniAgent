import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { researchAgent } from "../agents/researchAgent";
import { emailAgent } from "../agents/emailAgent";
import { codingAgent } from "../agents/codingAgent";
import { personalAssistant } from "../agents/personalAssistant";

export const delegateToSubAgent = createTool({
  id: "delegate-to-sub-agent",
  description: "Delegate a specific task to a specialized sub-agent for expert handling",
  inputSchema: z.object({
    agentType: z.enum(["research", "email", "coding", "personal"]).describe("The type of specialized agent to delegate to"),
    task: z.string().describe("The specific task or question to delegate to the sub-agent"),
    context: z.string().optional().describe("Additional context for the sub-agent"),
  }),
  outputSchema: z.object({
    response: z.string(),
    agentUsed: z.string(),
  }),
  execute: async ({ context: { agentType, task, context }, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info(`🤖 [Delegate] Delegating to ${agentType} agent`, { task, context });
    
    try {
      let agent;
      switch (agentType) {
        case "research":
          agent = researchAgent;
          break;
        case "email":
          agent = emailAgent;
          break;
        case "coding":
          agent = codingAgent;
          break;
        case "personal":
          agent = personalAssistant;
          break;
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }
      
      const messages = [
        { 
          role: "user" as const, 
          content: context ? `${task}\n\nContext: ${context}` : task 
        }
      ];
      
      const result = await agent.generate(messages, {
        maxSteps: 5,
      });
      
      logger?.info(`✅ [Delegate] ${agentType} agent completed task`, { 
        responseLength: result.text.length 
      });
      
      return {
        response: result.text,
        agentUsed: agent.name,
      };
    } catch (error) {
      logger?.error(`❌ [Delegate] Failed to delegate to ${agentType} agent`, { error });
      throw error;
    }
  },
});