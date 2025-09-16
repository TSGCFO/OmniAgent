import "dotenv/config";
import { mainAgent } from "./mastra/agents";
import { researchAgent } from "./mastra/agents/researchAgent";

async function testWorkingMemory() {
  const resourceId = "user-main";  // Single user ID
  const threadId = "test-" + Date.now();
  
  console.log("=== Testing Working Memory ===\n");
  console.log("Resource ID (shared across all agents):", resourceId);
  console.log("Thread ID:", threadId);
  console.log("\n");
  
  // Test 1: Main agent stores info
  console.log("📝 TEST 1: Main Agent - Store information");
  console.log("👤 User: My name is John, I'm a developer working on AI projects, and I prefer detailed technical explanations");
  
  const response1 = await mainAgent.stream(
    "My name is John, I'm a developer working on AI projects, and I prefer detailed technical explanations",
    {
      memory: {
        thread: threadId,
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Agent response:");
  for await (const chunk of response1.textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n\n");
  
  // Test 2: New thread, same user - should remember
  const newThreadId = "test-new-" + Date.now();
  console.log("📝 TEST 2: New conversation - checking memory persistence");
  console.log("New Thread ID:", newThreadId);
  console.log("👤 User: What do you remember about me and my preferences?");
  
  const response2 = await mainAgent.stream(
    "What do you remember about me and my preferences?",
    {
      memory: {
        thread: newThreadId,
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Agent response:");
  for await (const chunk of response2.textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n\n");
  
  // Test 3: Research agent with tool-call memory update
  console.log("📝 TEST 3: Research Agent - Testing tool-call memory");
  console.log("👤 User: Research quantum computing breakthroughs in 2024");
  
  const response3 = await researchAgent.generate(
    "Research quantum computing breakthroughs in 2024",
    {
      memory: {
        thread: threadId + "-research",
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Research Agent response:");
  console.log(response3.text);
  console.log("\n");
  
  // Test 4: Verify cross-agent memory sharing
  console.log("📝 TEST 4: Cross-Agent Memory Verification");
  console.log("👤 User: (to main agent) What research topics have I been interested in?");
  
  const response4 = await mainAgent.stream(
    "What research topics have I been interested in?",
    {
      memory: {
        thread: newThreadId + "-verify",
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Main Agent response:");
  for await (const chunk of response4.textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n");
  
  console.log("=== Test Complete ===\n");
}

// Direct memory update test
async function testDirectMemoryUpdate() {
  console.log("\n=== Testing Direct Memory Update ===");
  
  const memory = (mainAgent as any).memory;
  const resourceId = "user-main";
  const threadId = "direct-update-thread";
  
  try {
    // Directly update working memory
    await memory.updateWorkingMemory({
      threadId: threadId,
      resourceId: resourceId,
      workingMemory: `# User Profile
## Identity
- **Name**: John Doe
- **Role/Title**: Senior Developer
- **Primary Goals**: Build AI assistant system

## Preferences
- **Communication Style**: Technical, detailed
- **Working Hours**: 9 AM - 6 PM PST
- **Response Detail Level**: High

## Current Context
- **Active Projects**: Multi-agent AI system
- **Current Focus**: Memory implementation
- **Important Deadlines**: End of month

## Research Memory
## Topics of Interest
- **Primary Research Areas**: Quantum computing, AI safety
- **Recurring Questions**: Memory persistence patterns`
    });
    
    console.log("✅ Direct memory update complete");
    
    // Verify the update
    console.log("\n👤 User: Summarize what you know about my current projects and interests");
    const response = await mainAgent.stream(
      "Summarize what you know about my current projects and interests",
      {
        memory: {
          thread: "verify-direct-update",
          resource: resourceId
        }
      }
    );
    
    console.log("🤖 Agent response after direct update:");
    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
    }
    console.log("\n");
  } catch (error) {
    console.error("❌ Error during direct memory update:", error);
  }
}

// Run tests
async function runAllTests() {
  try {
    await testWorkingMemory();
    await testDirectMemoryUpdate();
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the tests
console.log("Starting working memory tests...\n");
runAllTests()
  .then(() => console.log("\nAll tests completed!"))
  .catch(console.error);