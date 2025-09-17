import { omniAgentNetwork } from "../mastra/network";
import { mastra } from "../mastra";

/**
 * Example: Using the OmniAgent Network
 * 
 * This file demonstrates various ways to interact with the AgentNetwork
 */

async function examples() {
  // Example 1: Basic generation using the network
  console.log("=== Example 1: Basic Network Generation ===");
  const basicResponse = await omniAgentNetwork.generate(
    [{ role: "user", content: "What are the latest trends in AI?" }],
    {
      maxSteps: 5
    }
  );
  console.log("Response:", basicResponse.text);

  // Example 2: Using network with specific routing hints
  console.log("\n=== Example 2: Research-Focused Query ===");
  const researchResponse = await omniAgentNetwork.generate(
    [{ role: "user", content: "I need a comprehensive research report on quantum computing applications in cryptography" }],
    {
      maxSteps: 10,
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls?.length) {
          console.log("Tools used:", toolCalls.map(t => t.toolName));
        }
      }
    }
  );
  console.log("Research completed, length:", researchResponse.text.length);

  // Example 3: Email composition through the network
  console.log("\n=== Example 3: Email Composition ===");
  const emailResponse = await omniAgentNetwork.generate(
    [{ role: "user", content: "Compose a professional email to a client explaining a project delay due to technical challenges" }]
  );
  console.log("Email draft created");

  // Example 4: Code review request
  console.log("\n=== Example 4: Code Review ===");
  const codeReview = await omniAgentNetwork.generate(
    [{
      role: "user", 
      content: `Review this TypeScript code for best practices:
      
      function fetchData(url) {
        return fetch(url).then(res => res.json()).catch(err => console.log(err));
      }
      `
    }]
  );
  console.log("Code review completed");

  // Example 5: Complex multi-step task
  console.log("\n=== Example 5: Complex Multi-Step Task ===");
  const complexTask = await omniAgentNetwork.generate(
    [{ 
      role: "user", 
      content: "Plan a 3-day tech conference including venue, speakers, and schedule"
    }],
    {
      maxSteps: 15,
      onStepFinish: ({ agent }) => {
        console.log(`Agent ${agent} completed a step`);
      }
    }
  );
  console.log("Conference planning completed");

  // Example 6: Research task with memory
  console.log("\n=== Example 6: Research Task with Memory ===");
  const workflowResult = await omniAgentNetwork.generate(
    [{ 
      role: "user", 
      content: "Research the future of Web3 and Blockchain for 2024-2025. Provide a comprehensive analysis."
    }],
    {
      resourceId: "research",
      threadId: "web3-research-001"
    }
  );
  console.log("Research completed");

  // Example 7: Simple coding task
  console.log("\n=== Example 7: Simple Coding Task ===");
  const agentResult = await omniAgentNetwork.generate(
    [{ 
      role: "user", 
      content: "Write a Python function to calculate fibonacci numbers efficiently"
    }],
    { maxSteps: 3 }
  );
  console.log("Code generated");
}

// Run examples (uncomment to execute)
// examples().catch(console.error);

// Export for use in other files
export { examples };
