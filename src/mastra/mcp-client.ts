import { MCPClient } from "@mastra/mcp";

// Configure MCPClient to connect to rube.app MCP server
export const mcpClient = new MCPClient({
  servers: {
    rubeApp: {
      url: new URL("https://rube.app/mcp"),
      requestInit: {
        headers: {
          "Authorization": `Bearer ${process.env.RUBE_MCP_TOKEN || ""}`,
        },
      },
    },
  },
});

// Export function to get all tools from the MCP server
export async function getMCPTools() {
  try {
    const tools = await mcpClient.getTools();
    console.log(`🔧 [MCP] Successfully loaded ${Object.keys(tools).length} tools from rube.app`);
    return tools;
  } catch (error) {
    console.error("❌ [MCP] Failed to load tools from rube.app:", error);
    return {};
  }
}