import "dotenv/config";
import { initializeMainAgent } from "./mastra/agents/agentFactory";

async function testMCPTools() {
  console.log("=== Testing MCP Tool Access ===\n");
  
  try {
    // Initialize the agent with MCP tools
    console.log("Initializing main agent with MCP tools...");
    const mainAgent = await initializeMainAgent();
    
    // List all available tools
    const tools = mainAgent.tools;
    const toolNames = Object.keys(tools);
    
    console.log(`\n✅ Agent has access to ${toolNames.length} tools:\n`);
    
    // Separate MCP tools from custom tools
    const mcpTools = toolNames.filter(name => 
      !['delegateToSubAgent', 'webScraper', 'deepResearch', 'selfLearning', 'semanticStorage', 'semanticRecall'].includes(name)
    );
    const customTools = toolNames.filter(name => 
      ['delegateToSubAgent', 'webScraper', 'deepResearch', 'selfLearning', 'semanticStorage', 'semanticRecall'].includes(name)
    );
    
    console.log("📦 MCP Tools from rube.app:");
    mcpTools.forEach(tool => console.log(`  - ${tool}`));
    
    console.log("\n🔧 Custom Tools:");
    customTools.forEach(tool => console.log(`  - ${tool}`));
    
    // Test agent awareness of MCP tools
    console.log("\n📝 TEST: Agent awareness of MCP tools");
    console.log("👤 User: What MCP tools do you have available?");
    
    const response = await mainAgent.generate(
      [{ role: "user", content: "List the MCP tools you have available from rube.app" }],
      {
        memory: {
          thread: "mcp-test",
          resource: "user-main"
        }
      }
    );
    
    console.log("🤖 Agent response:");
    console.log(response.text);
    
    // Test using an MCP tool
    console.log("\n📝 TEST 2: Using MCP tools");
    console.log("👤 User: Can you check if you can access Gmail through MCP?");
    
    const toolTestResponse = await mainAgent.generate(
      [{ role: "user", content: "Check what Gmail-related tools you have available through MCP" }],
      {
        memory: {
          thread: "mcp-gmail-test",
          resource: "user-main"
        }
      }
    );
    
    console.log("🤖 Agent response:");
    console.log(toolTestResponse.text);
    
    console.log("\n=== MCP Tool Test Complete ===");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
console.log("Starting MCP tool test...\n");
testMCPTools()
  .then(() => console.log("\nTest completed!"))
  .catch(console.error);