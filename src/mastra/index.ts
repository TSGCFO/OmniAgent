import "dotenv/config"; // Load environment variables first
import { Mastra } from "@mastra/core";
import { MastraError } from "@mastra/core/error";
import { PinoLogger } from "@mastra/loggers";
import { LogLevel, MastraLogger } from "@mastra/core/logger";
import pino from "pino";
import { MCPServer } from "@mastra/mcp";
import { NonRetriableError } from "inngest";
import { z } from "zod";
import { format } from "node:util";

import { sharedPostgresStorage } from "./storage";
import { inngest, inngestServe } from "./inngest";
import { assistantWorkflow } from "./workflows/assistantWorkflow";
import { orchestratorAgent } from "./agents/orchestratorAgent";
import { researchAgent } from "./agents/researchAgent";
import { emailAgent } from "./agents/emailAgent";
import { codingAgent } from "./agents/codingAgent";
import { personalAssistant } from "./agents/personalAssistant";
import { getMCPTools } from "./mcp-client";
import { delegateToSubAgent } from "./tools/delegateToSubAgent";
import { webScraper } from "./tools/webScraper";
import { deepResearch } from "./tools/deepResearch";
import { selfLearning } from "./tools/selfLearning";
import { semanticStorage } from "./tools/semanticStorage";
import { semanticRecall } from "./tools/semanticRecall";
import { getClient, registerSlackTrigger } from "../triggers/slackTriggers";

class ProductionPinoLogger extends MastraLogger {
  protected logger: pino.Logger;

  constructor(
    options: {
      name?: string;
      level?: LogLevel;
    } = {},
  ) {
    super(options);

    this.logger = pino({
      name: options.name || "app",
      level: options.level || LogLevel.INFO,
      base: {},
      formatters: {
        level: (label: string, _number: number) => ({
          level: label,
        }),
      },
      timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    });
  }

  debug(message: string, args: Record<string, any> = {}): void {
    this.logger.debug(args, message);
  }

  info(message: string, args: Record<string, any> = {}): void {
    this.logger.info(args, message);
  }

  warn(message: string, args: Record<string, any> = {}): void {
    this.logger.warn(args, message);
  }

  error(message: string, args: Record<string, any> = {}): void {
    this.logger.error(args, message);
  }
}

// Initialize tools for all agents on startup
(async () => {
  try {
    console.log("🚀 Initializing multi-agent system...");
    
    // Get MCP tools from the server
    const mcpTools = await getMCPTools();
    
    // Create core tools collection
    const coreTools = {
      webScraper,
      deepResearch,
      selfLearning,
      semanticStorage,
      semanticRecall,
    };
    
    // Combine all tools
    const allTools = {
      ...mcpTools,
      ...coreTools,
    };
    
    // Add delegation tool to orchestrator
    Object.assign(orchestratorAgent.tools, {
      delegateToSubAgent,
    });
    
    // Add tools to specialized agents
    Object.assign(researchAgent.tools, allTools);
    Object.assign(emailAgent.tools, allTools);
    Object.assign(codingAgent.tools, allTools);
    Object.assign(personalAssistant.tools, allTools);
    
    console.log(`✅ Multi-agent system initialized with ${Object.keys(allTools).length} tools`);
  } catch (error) {
    console.error("❌ Failed to initialize agents:", error);
    // Continue with just the custom tools
    const coreTools = {
      webScraper,
      deepResearch,
      selfLearning,
      semanticStorage,
      semanticRecall,
    };
    
    Object.assign(orchestratorAgent.tools, { delegateToSubAgent });
    Object.assign(researchAgent.tools, coreTools);
    Object.assign(emailAgent.tools, coreTools);
    Object.assign(codingAgent.tools, coreTools);
    Object.assign(personalAssistant.tools, coreTools);
    
    console.log("⚠️ Using fallback tools only");
  }
})();

export const mastra = new Mastra({
  storage: sharedPostgresStorage,
  agents: {
    orchestratorAgent,
    researchAgent,
    emailAgent,
    codingAgent,
    personalAssistant,
  },
  workflows: { assistantWorkflow },
  mcpServers: {
    allTools: new MCPServer({
      name: "allTools",
      version: "1.0.0",
      tools: {
        delegateToSubAgent,
        webScraper,
        deepResearch,
        selfLearning,
        semanticStorage,
        semanticRecall,
      },
    }),
  },
  bundler: {
    // A few dependencies are not properly picked up by
    // the bundler if they are not added directly to the
    // entrypoint.
    externals: [
      "@slack/web-api",
      "inngest",
      "inngest/hono",
      "hono",
      "hono/streaming",
      "@mastra/mcp",
    ],
    // sourcemaps are good for debugging.
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    middleware: [
      async (c, next) => {
        const mastra = c.get("mastra");
        const logger = mastra?.getLogger();
        logger?.debug("[Request]", { method: c.req.method, url: c.req.url });
        try {
          await next();
        } catch (error) {
          logger?.error("[Response]", {
            method: c.req.method,
            url: c.req.url,
            error,
          });
          if (error instanceof MastraError) {
            if (error.id === "AGENT_MEMORY_MISSING_RESOURCE_ID") {
              // This is typically a non-retirable error. It means that the request was not
              // setup correctly to pass in the necessary parameters.
              throw new NonRetriableError(error.message, { cause: error });
            }
          } else if (error instanceof z.ZodError) {
            // Validation errors are never retriable.
            throw new NonRetriableError(error.message, { cause: error });
          }

          throw error;
        }
      },
    ],
    apiRoutes: [
      // This API route is used to register the Mastra workflow (inngest function) on the inngest server
      {
        path: "/api/inngest",
        method: "ALL",
        createHandler: async ({ mastra }) => inngestServe({ mastra, inngest }),
        // The inngestServe function integrates Mastra workflows with Inngest by:
        // 1. Creating Inngest functions for each workflow with unique IDs (workflow.${workflowId})
        // 2. Setting up event handlers that:
        //    - Generate unique run IDs for each workflow execution
        //    - Create an InngestExecutionEngine to manage step execution
        //    - Handle workflow state persistence and real-time updates
        // 3. Establishing a publish-subscribe system for real-time monitoring
        //    through the workflow:${workflowId}:${runId} channel
      },
      // Slack trigger for the AI assistant
      ...registerSlackTrigger({
        triggerType: "slack/message.channels",
        handler: async (mastra: Mastra, triggerInfo) => {
          const logger = mastra.getLogger();
          const { slack, auth } = await getClient();
          logger?.info("📝 [Trigger] Slack message received", { triggerInfo });

          // Check if we should respond to this message
          const isDirectMessage = triggerInfo.payload?.event?.channel_type === "im";
          const isMention = triggerInfo.payload?.event?.text?.includes(`<@${auth.user_id}>`);
          const shouldRespond = isDirectMessage || isMention;
          const channel = triggerInfo.payload?.event?.channel;
          const timestamp = triggerInfo.payload?.event?.ts;

          if (!shouldRespond) {
            logger?.info("🔕 [Trigger] Ignoring message (not DM or mention)");
            return null;
          }

          // React to the message to show we're processing it
          if (channel && timestamp) {
            try {
              await slack.reactions.add({
                channel,
                timestamp,
                name: "hourglass_flowing_sand",
              });
            } catch (error) {
              logger?.error("📝 [Slack Trigger] Error adding reaction", {
                error: format(error),
              });
            }
          }

          // Extract and clean the message text
          const messageText = triggerInfo.payload?.event?.text || "";
          const cleanedMessage = messageText.replace(/<@[A-Z0-9]+>/g, "").trim();
          const thread_ts = triggerInfo.payload?.event?.thread_ts;
          
          // Start the workflow to process the message
          logger?.info("🚀 [Trigger] Starting assistant workflow");
          const run = await mastra.getWorkflow("assistantWorkflow").createRunAsync();
          return await run.start({
            inputData: {
              message: cleanedMessage, // Send cleaned message directly
              threadId: `slack/${channel}/${thread_ts || timestamp}`,
              channel: channel,
            }
          });
        },
      }),
    ],
  },
  logger:
    process.env.NODE_ENV === "production"
      ? new ProductionPinoLogger({
          name: "Mastra",
          level: "info",
        })
      : new PinoLogger({
          name: "Mastra",
          level: "info",
        }),
});

/*  Sanity check 1: Throw an error if there are more than 1 workflows.  */
// !!!!!! Do not remove this check. !!!!!!
// Note: Networks may contain their own workflows, but we only check top-level ones
if (Object.keys(mastra.getWorkflows()).length > 1) {
  throw new Error(
    "More than 1 workflows found. Currently, more than 1 workflows are not supported in the UI, since doing so will cause app state to be inconsistent.",
  );
}

/*  Sanity check 2: We have multiple agents but UI may only show one  */
// !!!!!! Do not remove this check. !!!!!!
// Note: We have 5 agents (orchestrator + 4 specialized) for multi-agent functionality
// The UI may only display the orchestrator agent
const agentCount = Object.keys(mastra.getAgents()).length;
if (agentCount !== 5) {
  console.warn(
    `Expected 5 agents but found ${agentCount}. The UI may only show the orchestrator agent.`,
  );
}
