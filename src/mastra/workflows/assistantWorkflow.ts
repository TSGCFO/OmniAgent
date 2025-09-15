import { createWorkflow, createStep } from "../inngest";
import { z } from "zod";
import { mainAgent } from "../agents";
import { getClient } from "../../triggers/slackTriggers";
import { format } from "node:util";

// Step 1: Process message with the agent (ONLY call agent.generate())
const processWithAgent = createStep({
  id: "process-with-agent",
  description: "Call the agent to generate a response",
  inputSchema: z.object({
    message: z.string(),
    threadId: z.string(),
    channel: z.string().optional(),
  }),
  outputSchema: z.object({
    response: z.string(),
    threadId: z.string(),
    channel: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🤖 [Workflow Step 1] Calling agent.generate()", {
      threadId: inputData.threadId,
    });
    
    // ONLY call agent.generate() - no other logic
    const { text } = await mainAgent.generate([
      { role: "user", content: inputData.message }
    ], {
      resourceId: "slack-bot",
      threadId: inputData.threadId,
      maxSteps: 10,
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls && toolCalls.length > 0) {
          logger?.info("🔄 [Agent] Using tools", {
            tools: toolCalls.map(t => t.toolName),
          });
        }
      },
    });
    
    logger?.info("✅ [Workflow Step 1] Agent response generated", {
      responseLength: text.length,
    });
    
    return {
      response: text,
      threadId: inputData.threadId,
      channel: inputData.channel,
    };
  },
});

// Step 2: Send the response to Slack (ONLY send message)
const sendSlackReply = createStep({
  id: "send-slack-reply",
  description: "Send the agent's response to Slack",
  inputSchema: z.object({
    response: z.string(),
    threadId: z.string(),
    channel: z.string().optional(),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    
    // Parse channel and thread info from inputData if needed
    let channel = inputData.channel;
    let thread_ts = undefined;
    
    // If channel isn't provided, extract from threadId pattern
    if (!channel && inputData.threadId.startsWith("slack/")) {
      const parts = inputData.threadId.split("/");
      if (parts.length >= 3) {
        channel = parts[1];
        thread_ts = parts[2];
      }
    }
    
    if (!channel) {
      logger?.error("❌ [Workflow Step 2] No channel provided");
      return { sent: false };
    }
    
    logger?.info("💬 [Workflow Step 2] Sending to Slack", {
      channel,
      thread_ts,
    });
    
    try {
      const { slack } = await getClient();
      
      // ONLY send the message - no other logic
      await slack.chat.postMessage({
        channel,
        text: inputData.response,
        thread_ts,
      });
      
      logger?.info("✅ [Workflow Step 2] Sent to Slack");
      return { sent: true };
    } catch (error) {
      logger?.error("❌ [Workflow Step 2] Failed to send", {
        error: format(error),
      });
      return { sent: false };
    }
  },
});

// Create the workflow with exactly 2 steps
export const assistantWorkflow = createWorkflow({
  id: "assistant-workflow",
  description: "AI assistant workflow with agent and Slack reply",
  inputSchema: z.object({
    message: z.string(),
    threadId: z.string(),
    channel: z.string().optional(),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
  }),
})
  .then(processWithAgent)
  .then(sendSlackReply)
  .commit();