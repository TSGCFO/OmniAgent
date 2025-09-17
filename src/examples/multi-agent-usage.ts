import { orchestratorAgent } from "../mastra/agents/orchestratorAgent";
import { mastra } from "../mastra";

/**
 * Example: Using the Multi-Agent System
 * 
 * This file demonstrates various ways to interact with the orchestrator
 * and specialized agents
 */

async function examples() {
  // Example 1: Basic orchestration
  console.log("=== Example 1: Basic Orchestration ===");
  const basicResponse = await orchestratorAgent.generate(
    [{ role: "user", content: "What are the latest trends in AI?" }],
    {
      maxSteps: 10,
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls?.length) {
          console.log("Tools used:", toolCalls.map(t => t.toolName));
        }
      }
    }
  );
  console.log("Response:", basicResponse.text);

  // Example 2: Research task
  console.log("\n=== Example 2: Research Task ===");
  const researchResponse = await orchestratorAgent.generate(
    [{ 
      role: "user", 
      content: "I need a comprehensive research report on quantum computing applications in cryptography"
    }],
    {
      resourceId: "examples",
      threadId: "quantum-research",
      maxSteps: 10
    }
  );
  console.log("Research completed");

  // Example 3: Email composition
  console.log("\n=== Example 3: Email Composition ===");
  const emailResponse = await orchestratorAgent.generate(
    [{
      role: "user",
      content: "Compose a professional email to a client explaining a project delay due to technical challenges"
    }],
    {
      resourceId: "examples", 
      threadId: "email-composition"
    }
  );
  console.log("Email draft created");

  // Example 4: Code review
  console.log("\n=== Example 4: Code Review ===");
  const codeReview = await orchestratorAgent.generate(
    [{
      role: "user",
      content: `Review this TypeScript code for best practices:
      
      function fetchData(url) {
        return fetch(url).then(res => res.json()).catch(err => console.log(err));
      }
      `
    }],
    {
      resourceId: "examples",
      threadId: "code-review"
    }
  );
  console.log("Code review completed");

  // Example 5: Complex multi-domain task
  console.log("\n=== Example 5: Complex Multi-Domain Task ===");
  const complexTask = await orchestratorAgent.generate(
    [{ 
      role: "user", 
      content: "Research the best practices for secure API development, then write an email to the development team summarizing the findings and create a code example demonstrating proper authentication"
    }],
    {
      resourceId: "examples",
      threadId: "complex-task",
      maxSteps: 15,
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls?.length) {
          console.log("Orchestrator delegating to:", toolCalls.map(t => t.toolName));
        }
      }
    }
  );
  console.log("Complex task completed");

  // Example 6: Direct agent access (bypassing orchestrator)
  console.log("\n=== Example 6: Direct Agent Access ===");
  const researchAgent = mastra.getAgent("researchAgent");
  const directResearch = await researchAgent.generate(
    [{ 
      role: "user", 
      content: "What are the latest developments in renewable energy?"
    }],
    { 
      maxSteps: 5
    }
  );
  console.log("Direct research completed");
}

// Run examples (uncomment to execute)
// examples().catch(console.error);

// Export for use in other files
export { examples };
