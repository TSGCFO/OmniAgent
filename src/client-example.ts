import "dotenv/config";
import { MastraClient } from "@mastra/client-js";

async function clientExample() {
  console.log("🌐 Testing OmniAgent Network via Client...\n");

  try {
    // Create Mastra client
    const client = new MastraClient({
      baseUrl: process.env.MASTRA_BASE_URL || "http://localhost:5000",
    });

    // Get the network
    const network = client.getNetwork('omni-network');
    if (!network) {
      throw new Error('OmniAgent Network not found');
    }

    console.log("✅ Connected to OmniAgent Network via client");
    console.log();

    // Test streaming response
    console.log("🔄 Test: Streaming Response");
    console.log("Question: Explain quantum computing in simple terms");
    
    const stream = await network.stream(
      "Explain quantum computing in simple terms",
      {
        memory: {
          resource: "client-user",
          thread: "client-test-thread",
        },
        maxSteps: 5,
      }
    );

    console.log("Streaming response:");
    for await (const chunk of stream.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\n---\n");

    // Test complex task that might use workflows
    console.log("🔬 Test: Complex Research Task");
    console.log("Task: Research the impact of climate change on agriculture and provide a comprehensive report");
    
    const complexResult = await network.generate(
      "Research the impact of climate change on agriculture and provide a comprehensive report",
      {
        memory: {
          resource: "client-user",
          thread: "client-complex-thread",
        },
        maxSteps: 15, // Allow more steps for complex tasks
      }
    );
    
    console.log("Response:", complexResult.text);
    console.log("---\n");

    console.log("✅ Client tests completed successfully!");

  } catch (error) {
    console.error("❌ Client test failed:", error);
  }
}

// Run the client test
clientExample().catch(console.error);
