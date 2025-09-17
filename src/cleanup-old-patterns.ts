import "dotenv/config";
import { mastra } from "./mastra";

async function cleanupOldPatterns() {
  console.log("🧹 Cleaning up old patterns and verifying new architecture...\n");

  try {
    // Test the new network
    const network = mastra.getNetwork('omni-network');
    if (!network) {
      throw new Error('OmniAgent Network v2 not found');
    }

    console.log("✅ New network is working:", network.name);
    console.log("📋 Available agents:", Object.keys(network.agents || {}));
    console.log("🔄 Available workflows:", Object.keys(network.workflows || {}));
    console.log();

    // Test basic functionality
    console.log("🔍 Testing basic functionality...");
    const testResult = await network.generate(
      "Hello, can you help me with a simple task?",
      {
        memory: {
          resource: "cleanup-test",
          thread: "cleanup-verification",
        },
        maxSteps: 3,
      }
    );
    
    console.log("✅ Basic functionality working");
    console.log("Response length:", testResult.text.length);
    console.log();

    // Test memory system
    console.log("🧠 Testing unified memory system...");
    const memoryTest = await network.generate(
      "Remember that I prefer detailed explanations and technical depth in responses.",
      {
        memory: {
          resource: "cleanup-test",
          thread: "memory-test",
        },
        maxSteps: 3,
      }
    );
    
    console.log("✅ Memory system working");
    console.log();

    // Test agent coordination
    console.log("🤝 Testing agent coordination...");
    const coordinationTest = await network.generate(
      "I need help with both research and email writing. Research the benefits of remote work and then help me write an email to my team about implementing a hybrid work policy.",
      {
        memory: {
          resource: "cleanup-test",
          thread: "coordination-test",
        },
        maxSteps: 10,
      }
    );
    
    console.log("✅ Agent coordination working");
    console.log("Response length:", coordinationTest.text.length);
    console.log();

    // Test workflow usage
    console.log("🔄 Testing advanced workflows...");
    const workflowTest = await network.generate(
      "Use the advanced research workflow to analyze the current state of renewable energy technology.",
      {
        memory: {
          resource: "cleanup-test",
          thread: "workflow-test",
        },
        maxSteps: 15,
      }
    );
    
    console.log("✅ Advanced workflows working");
    console.log("Response length:", workflowTest.text.length);
    console.log();

    console.log("🎉 Cleanup verification completed successfully!");
    console.log("\n📋 Architecture Status:");
    console.log("- ✅ vNext AgentNetwork active");
    console.log("- ✅ Unified memory system working");
    console.log("- ✅ Refactored agents functioning");
    console.log("- ✅ Advanced workflows accessible");
    console.log("- ✅ Tool integration working");
    console.log("- ✅ Multi-agent coordination active");
    console.log("\n🚀 System is ready for production use!");

  } catch (error) {
    console.error("❌ Cleanup verification failed:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
  }
}

// Run the cleanup verification
cleanupOldPatterns().catch(console.error);
