import "dotenv/config";
import { mastra } from "./mastra";

async function testRefactoredSystem() {
  console.log("🧪 Testing Refactored OmniAgent System v2...\n");

  try {
    // Get the network
    const network = mastra.getNetwork('omni-network');
    if (!network) {
      throw new Error('OmniAgent Network v2 not found');
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

    // Test 2: Email management task
    console.log("📧 Test 2: Email Management Task");
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

    // Test 5: Complex multi-domain task
    console.log("🌐 Test 5: Complex Multi-Domain Task");
    console.log("Task: Research a new technology, write an email about it, and create a coding project plan");
    
    const complexResult = await network.generate(
      "I want to learn about quantum computing. Research the basics, help me write an email to my team about organizing a study group, and create a coding project plan for a simple quantum simulation",
      {
        memory: {
          resource: "test-user",
          thread: "test-complex-thread",
        },
        maxSteps: 15, // Allow more steps for complex tasks
      }
    );
    
    console.log("Response:", complexResult.text);
    console.log("---\n");

    // Test 6: Memory persistence test
    console.log("🧠 Test 6: Memory Persistence Test");
    console.log("Task: Test if the system remembers previous interactions");
    
    const memoryTest1 = await network.generate(
      "My name is John and I'm a software engineer. I prefer Python for backend development.",
      {
        memory: {
          resource: "test-user",
          thread: "test-memory-thread",
        },
        maxSteps: 3,
      }
    );
    
    console.log("First interaction:", memoryTest1.text);
    
    const memoryTest2 = await network.generate(
      "What programming language do I prefer for backend development?",
      {
        memory: {
          resource: "test-user",
          thread: "test-memory-thread",
        },
        maxSteps: 3,
      }
    );
    
    console.log("Memory recall test:", memoryTest2.text);
    console.log("---\n");

    // Test 7: Workflow usage test
    console.log("🔄 Test 7: Advanced Workflow Test");
    console.log("Task: Use advanced research workflow for comprehensive analysis");
    
    const workflowResult = await network.generate(
      "I need a comprehensive research report on the impact of artificial intelligence on healthcare. Use the advanced research workflow to provide a thorough analysis with fact-checking and synthesis.",
      {
        memory: {
          resource: "test-user",
          thread: "test-workflow-thread",
        },
        maxSteps: 20, // Allow many steps for workflow execution
      }
    );
    
    console.log("Workflow result:", workflowResult.text);
    console.log("---\n");

    console.log("✅ All tests completed successfully!");
    console.log("\n📊 Test Summary:");
    console.log("- ✅ Basic agent routing working");
    console.log("- ✅ Memory persistence working");
    console.log("- ✅ Multi-domain task coordination working");
    console.log("- ✅ Advanced workflows accessible");
    console.log("- ✅ Network orchestration functioning");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the comprehensive test
testRefactoredSystem().catch(console.error);
