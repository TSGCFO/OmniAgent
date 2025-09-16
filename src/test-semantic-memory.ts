import "dotenv/config";
import { mainAgent } from "./mastra/agents";
import { researchAgent } from "./mastra/agents/researchAgent";

async function testSemanticMemory() {
  const resourceId = "user-main";  // Single user ID
  console.log("=== Testing Semantic Memory with PgVector ===\n");
  console.log("Resource ID (shared across all agents):", resourceId);
  console.log("Using OpenAI text-embedding-3-small model for embeddings");
  console.log("\n");
  
  // Test 1: Create embeddings by having multiple conversations
  console.log("📝 TEST 1: Creating semantic embeddings with conversations");
  
  const conversations = [
    {
      threadId: "semantic-test-1",
      message: "I'm working on a React project using TypeScript and Next.js. I need help setting up authentication with OAuth 2.0."
    },
    {
      threadId: "semantic-test-2", 
      message: "Can you explain quantum computing and how qubits differ from classical bits?"
    },
    {
      threadId: "semantic-test-3",
      message: "I need to optimize my PostgreSQL database. The queries are running slowly on large tables with millions of rows."
    },
    {
      threadId: "semantic-test-4",
      message: "What's the best way to implement real-time features in a web application? Should I use WebSockets or Server-Sent Events?"
    },
    {
      threadId: "semantic-test-5",
      message: "I'm planning a trip to Japan. What are the must-visit places in Tokyo and Kyoto?"
    }
  ];
  
  // Store conversations to build semantic memory
  console.log("Storing conversations to build semantic memory...\n");
  for (const conv of conversations) {
    console.log(`👤 Thread ${conv.threadId}: ${conv.message.substring(0, 60)}...`);
    
    const response = await mainAgent.generate(
      [{ role: "user", content: conv.message }],
      {
        memory: {
          thread: conv.threadId,
          resource: resourceId
        }
      }
    );
    
    console.log(`🤖 Agent stored response for semantic indexing\n`);
  }
  
  // Test 2: Test semantic recall with related query
  console.log("\n📝 TEST 2: Testing semantic recall with related query");
  console.log("👤 User: I'm having issues with my Next.js authentication setup, specifically with JWT tokens");
  
  const relatedResponse = await mainAgent.generate(
    [{ 
      role: "user", 
      content: "I'm having issues with my Next.js authentication setup, specifically with JWT tokens" 
    }],
    {
      memory: {
        thread: "semantic-recall-test-1",
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Agent response (should recall OAuth conversation):");
  console.log(relatedResponse.text);
  console.log("\n");
  
  // Test 3: Test semantic recall with different but related topic
  console.log("📝 TEST 3: Testing semantic recall with database optimization query");
  console.log("👤 User: My application is slow. I think it might be the database queries.");
  
  const dbResponse = await mainAgent.generate(
    [{ 
      role: "user", 
      content: "My application is slow. I think it might be the database queries." 
    }],
    {
      memory: {
        thread: "semantic-recall-test-2",
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Agent response (should recall PostgreSQL optimization conversation):");
  console.log(dbResponse.text);
  console.log("\n");
  
  // Test 4: Cross-agent semantic memory
  console.log("📝 TEST 4: Testing cross-agent semantic memory");
  console.log("👤 User (to Research Agent): Tell me more about quantum computing applications");
  
  const crossAgentResponse = await researchAgent.generate(
    [{ 
      role: "user", 
      content: "Tell me more about quantum computing applications in cryptography" 
    }],
    {
      memory: {
        thread: "semantic-cross-agent-test",
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Research Agent response (should have context from previous quantum discussion):");
  console.log(crossAgentResponse.text);
  console.log("\n");
  
  // Test 5: Test custom semantic tools
  console.log("📝 TEST 5: Testing custom semantic storage and recall tools");
  console.log("Storing custom knowledge with semantic embeddings...");
  
  // Store some custom knowledge using the semantic tools
  await mainAgent.generate(
    [{ 
      role: "user", 
      content: "Store this information: The user prefers using Tailwind CSS for styling, Prisma for database ORM, and prefers functional components over class components in React." 
    }],
    {
      memory: {
        thread: "semantic-custom-test",
        resource: resourceId
      }
    }
  );
  
  console.log("✅ Custom knowledge stored with embeddings");
  
  // Recall the custom knowledge
  console.log("\n👤 User: What are my React and styling preferences?");
  
  const customRecallResponse = await mainAgent.generate(
    [{ 
      role: "user", 
      content: "What are my React component and CSS framework preferences?" 
    }],
    {
      memory: {
        thread: "semantic-custom-recall",
        resource: resourceId
      }
    }
  );
  
  console.log("🤖 Agent response (using semantic recall):");
  console.log(customRecallResponse.text);
  
  console.log("\n=== Semantic Memory Test Complete ===\n");
}

// Test vector similarity directly
async function testVectorSimilarity() {
  console.log("\n=== Testing Vector Similarity Search ===");
  
  const resourceId = "user-main";
  
  // Test similarity between different queries
  const queries = [
    "authentication OAuth JWT tokens",
    "login system security",
    "quantum computing qubits",
    "database optimization PostgreSQL"
  ];
  
  console.log("Testing semantic similarity between queries:");
  console.log("Base query: 'authentication OAuth JWT tokens'");
  console.log("\nSimilar queries should have higher relevance scores:");
  
  for (const query of queries.slice(1)) {
    console.log(`- "${query}"`);
  }
  
  // The agent's semantic recall should automatically find similar conversations
  const response = await mainAgent.generate(
    [{ 
      role: "user", 
      content: "Based on our previous conversations, what authentication methods have we discussed?" 
    }],
    {
      memory: {
        thread: "similarity-test",
        resource: resourceId
      }
    }
  );
  
  console.log("\n🤖 Agent recalls from semantic memory:");
  console.log(response.text);
  
  console.log("\n=== Vector Similarity Test Complete ===\n");
}

// Run all tests
async function runAllTests() {
  try {
    await testSemanticMemory();
    await testVectorSimilarity();
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the tests
console.log("Starting semantic memory tests...\n");
runAllTests()
  .then(() => console.log("\nAll semantic memory tests completed!"))
  .catch(console.error);