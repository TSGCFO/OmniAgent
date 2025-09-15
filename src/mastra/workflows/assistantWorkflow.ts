import { createWorkflow, createStep } from "../inngest";
import { z } from "zod";
import { createMainAgent } from "../agents/mainAgent";
import { getClient } from "../../triggers/slackTriggers";
import { format } from "node:util";

// Step 1: Process message with the orchestrator agent
const processWithAgent = createStep({
  id: "process-with-agent",
  description: "Process the user's message with the orchestrator agent",
  inputSchema: z.object({
    message: z.string(),
    threadId: z.string(),
  }),
  outputSchema: z.object({
    response: z.string(),
    threadId: z.string(),
    channel: z.string(),
    timestamp: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🤖 [Workflow] Processing message with orchestrator agent", {
      threadId: inputData.threadId,
    });
    
    try {
      // Parse the Slack message payload
      const payload = JSON.parse(inputData.message);
      const event = payload.event;
      const messageText = event.text || "";
      const channel = event.channel;
      const timestamp = event.thread_ts || event.ts;
      
      // Clean up the message (remove bot mentions)
      const cleanedMessage = messageText.replace(/<@[A-Z0-9]+>/g, "").trim();
      
      logger?.info("📝 [Workflow] Cleaned message", { 
        original: messageText,
        cleaned: cleanedMessage 
      });
      
      // Initialize and get the main agent
      const agent = await createMainAgent();
      
      // Generate response using the agent
      const { text } = await agent.generate([
        { role: "user", content: cleanedMessage }
      ], {
        resourceId: "slack-bot",
        threadId: inputData.threadId,
        maxSteps: 10, // Allow multiple tool calls
      });
      
      logger?.info("✅ [Workflow] Agent generated response", {
        responseLength: text.length,
      });
      
      return {
        response: text,
        threadId: inputData.threadId,
        channel,
        timestamp,
      };
    } catch (error) {
      logger?.error("❌ [Workflow] Failed to process with agent", { error: format(error) });
      throw error;
    }
  },
});

// Step 2: Send the response back to Slack
const sendSlackReply = createStep({
  id: "send-slack-reply",
  description: "Send the agent's response back to Slack",
  inputSchema: z.object({
    response: z.string(),
    threadId: z.string(),
    channel: z.string(),
    timestamp: z.string().optional(),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
    messageTs: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("💬 [Workflow] Sending reply to Slack", {
      channel: inputData.channel,
      threadId: inputData.threadId,
    });
    
    try {
      const { slack } = await getClient();
      
      // Send the message to Slack
      const result = await slack.chat.postMessage({
        channel: inputData.channel,
        text: inputData.response,
        thread_ts: inputData.timestamp, // Reply in thread if available
      });
      
      logger?.info("✅ [Workflow] Successfully sent Slack reply", {
        messageTs: result.ts,
      });
      
      return {
        sent: true,
        messageTs: result.ts,
      };
    } catch (error) {
      logger?.error("❌ [Workflow] Failed to send Slack reply", { error: format(error) });
      return {
        sent: false,
      };
    }
  },
});

// Create the workflow
export const assistantWorkflow = createWorkflow({
  id: "assistant-workflow",
  description: "Multi-agent AI assistant workflow for Slack messages",
  inputSchema: z.object({
    message: z.string(),
    threadId: z.string(),
  }),
  outputSchema: z.object({
    sent: z.boolean(),
    messageTs: z.string().optional(),
  }),
})
  .then(processWithAgent)
  .then(sendSlackReply)
  .commit();