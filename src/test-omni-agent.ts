import "dotenv/config";
import { mastra } from "./mastra";

async function testOmniAgent() {
  console.log("🧪 Testing OmniAgent System...\n");

  const omniAgent = mastra.getAgent("omniAgent");
  if (!omniAgent) {
    console.error("❌ OmniAgent not found!");
    return;
  }

  // Test 1: Simple Research Task
  console.log("📚 Test 1: Research Task");
  const researchResult = await omniAgent.generate(
    "Research the latest trends in AI and machine learning for 2024",
    {
      memory: {
        resource: "test-user",
        thread: "research-test",
      },
      maxSteps: 5,
    }
  );
  console.log("Research Result:", researchResult.text.substring(0, 200) + "...\n");

  // Test 2: Email Task
  console.log("📧 Test 2: Email Task");
  const emailResult = await omniAgent.generate(
    "Write a professional email to a client about postponing a meeting due to illness",
    {
      memory: {
        resource: "test-user",
        thread: "email-test",
      },
      maxSteps: 5,
    }
  );
  console.log("Email Result:", emailResult.text.substring(0, 200) + "...\n");

  // Test 3: Coding Task
  console.log("💻 Test 3: Coding Task");
  const codingResult = await omniAgent.generate(
    "Write a TypeScript function that implements a binary search algorithm",
    {
      memory: {
        resource: "test-user",
        thread: "coding-test",
      },
      maxSteps: 5,
    }
  );
  console.log("Coding Result:", codingResult.text.substring(0, 200) + "...\n");

  // Test 4: Personal Assistant Task
  console.log("📅 Test 4: Personal Assistant Task");
  const personalResult = await omniAgent.generate(
    "Help me plan a productive morning routine that includes exercise, meditation, and work",
    {
      memory: {
        resource: "test-user",
        thread: "personal-test",
      },
      maxSteps: 5,
    }
  );
  console.log("Personal Result:", personalResult.text.substring(0, 200) + "...\n");

  // Test 5: Complex Multi-Domain Task
  console.log("🌟 Test 5: Complex Multi-Domain Task");
  const complexResult = await omniAgent.generate(
    "I'm starting a new AI startup. Research the market, draft an announcement email, and create a simple Python script for a proof of concept chatbot",
    {
      memory: {
        resource: "test-user",
        thread: "complex-test",
      },
      maxSteps: 10,
    }
  );
  console.log("Complex Result:", complexResult.text.substring(0, 300) + "...\n");

  console.log("✅ All tests completed!");
}

// Run the tests
testOmniAgent().catch(console.error);
