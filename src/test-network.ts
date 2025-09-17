import "dotenv/config";
import { mastra } from "./mastra";

async function testOmniNetwork() {
  console.log("🧪 Testing OmniAgent Network...\n");

  try {
    // Get the network
    const network = mastra.getNetwork('omni-network');
    if (!network) {
      throw new Error('OmniAgent Network not found');
    }

    console.log("✅ Network found:", network.name);
    console.log("📋 Available agents:", Object.keys(network.agents || {}));
    console.log("🔄 Available workflows:", Object.keys(network.workflows || {}));
    console.log();

    // Test 1: Simple research task
    console.log("🔍 Test 1: Research Task");
    console.log("Question: What are the latest trends in AI development?");
    
    const researchResult = await network.generate(
      "What are the latest trends in AI development?",
      {
        memory: {
          resource: "test-user",
          thread: "test-research-thread",
        },
        maxSteps: 5,
      }
    );
    
    console.log("Response:", researchResult.text);
    console.log("---\n");

    // Test 2: Email task
    console.log("📧 Test 2: Email Task");
    console.log("Task: Help me draft a professional email to my manager about a project update");
    
    const emailResult = await network.generate(
      "Help me draft a professional email to my manager about a project update",
      {
        memory: {
          resource: "test-user",
          thread: "test-email-thread",
        },
        maxSteps: 5,
      }
    );
    
    console.log("Response:", emailResult.text);
    console.log("---\n");

    // Test 3: Coding task
    console.log("💻 Test 3: Coding Task");
    console.log("Task: Review this JavaScript function and suggest improvements");
    
    const codingResult = await network.generate(
      "Review this JavaScript function and suggest improvements:\n\nfunction calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}",
      {
        memory: {
          resource: "test-user",
          thread: "test-coding-thread",
        },
        maxSteps: 5,
      }
    );
    
    console.log("Response:", codingResult.text);
    console.log("---\n");

    // Test 4: Personal task
    console.log("📅 Test 4: Personal Task");
    console.log("Task: Help me plan my day and set some goals");
    
    const personalResult = await network.generate(
      "Help me plan my day and set some goals",
      {
        memory: {
          resource: "test-user",
          thread: "test-personal-thread",
        },
        maxSteps: 5,
      }
    );
    
    console.log("Response:", personalResult.text);
    console.log("---\n");

    console.log("✅ All tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testOmniNetwork().catch(console.error);
