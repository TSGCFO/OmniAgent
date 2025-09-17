# OmniAgent Network Architecture

This directory contains the vNext AgentNetwork implementation for the OmniAgent system, which provides intelligent multi-agent orchestration using Mastra's latest network capabilities.

## Architecture Overview

The OmniAgent Network uses Mastra's vNext AgentNetwork to coordinate multiple specialized agents and workflows, providing a unified interface for complex AI tasks.

### Key Components

1. **OmniAgent Network** (`omni-network.ts`)
   - Main network coordinator
   - Routes tasks to appropriate agents or workflows
   - Handles tool loading and memory management
   - Provides unified interface for all AI capabilities

2. **Specialized Agents**
   - **Research Agent**: Deep research, web searches, fact-checking
   - **Email Agent**: Email management, composition, organization
   - **Coding Agent**: Programming assistance, code reviews
   - **Personal Assistant**: Scheduling, reminders, personal organization

3. **Workflows**
   - **Deep Research Workflow**: Comprehensive research with fact-checking and synthesis
   - **Email Management Workflow**: Complete email analysis and response generation
   - **Coding Assistance Workflow**: Code analysis, review, and improvement

4. **Tools**
   - MCP tools from rube.app (500+ integrations)
   - Custom tools for semantic memory, web scraping, etc.

## Usage

### Server-side Usage

```typescript
import { mastra } from './mastra';

// Get the network
const network = mastra.getVNextNetwork('omni-network');

// Simple task
const result = await network.generate("What are the latest AI trends?", {
  memory: {
    resource: "user-123",
    thread: "conversation-1",
  },
  maxSteps: 5,
});

// Complex task (may use workflows)
const complexResult = await network.generate(
  "Research climate change impact on agriculture and write a report",
  {
    memory: {
      resource: "user-123",
      thread: "research-project",
    },
    maxSteps: 15,
  }
);

// Streaming
const stream = await network.stream("Explain quantum computing", {
  memory: {
    resource: "user-123",
    thread: "learning-session",
  },
});

for await (const chunk of stream.textStream) {
  console.log(chunk);
}
```

### Client-side Usage

```typescript
import { MastraClient } from "@mastra/client-js";

const client = new MastraClient({
  baseUrl: "http://localhost:5000",
});

const network = client.getVNextNetwork('omni-network');

const result = await network.generate("Help me with my project", {
  memory: {
    resource: "user-123",
    thread: "project-help",
  },
});
```

### Loop Method for Complex Tasks

For tasks that require multiple steps and agent coordination:

```typescript
const result = await network.loop(
  "Research the top 3 cities in France, analyze each one thoroughly, and create a comprehensive travel guide",
  {
    memory: {
      resource: "user-123",
      thread: "travel-research",
    },
  }
);
```

## Memory Management

The network uses shared memory across all agents and workflows:

- **Resource-based**: Each user has their own memory space
- **Thread-based**: Conversations are organized by threads
- **Semantic recall**: Intelligent retrieval of relevant past conversations
- **Working memory**: Persistent user profile and preferences

## Tool Integration

The network automatically loads and manages:

1. **MCP Tools**: 500+ app integrations from rube.app
2. **Custom Tools**: Semantic storage, web scraping, self-learning
3. **Agent-specific Tools**: Each agent has access to relevant tools

## Workflow Examples

### Deep Research Workflow
1. Research step: Gather information on topic
2. Fact-check step: Verify findings
3. Synthesis step: Create comprehensive report

### Email Management Workflow
1. Analysis step: Analyze email content and priority
2. Response generation: Create appropriate response
3. Organization: Categorize and file email

### Coding Assistance Workflow
1. Code analysis: Review code quality and issues
2. Improvement suggestions: Provide optimization recommendations
3. Explanation: Explain changes and best practices

## Benefits of vNext AgentNetwork

1. **Intelligent Routing**: LLM-based decision making for task distribution
2. **Dynamic Orchestration**: Automatic coordination of multiple agents
3. **Memory Sharing**: Shared context across all agents and workflows
4. **Tool Management**: Centralized tool loading and distribution
5. **Scalability**: Easy to add new agents and workflows
6. **Flexibility**: Supports both simple and complex multi-step tasks

## Migration from Tool-based Delegation

The new architecture replaces the previous tool-based delegation pattern with:

- **Before**: Manual delegation through `delegateToSubAgent` tool
- **After**: Automatic routing and orchestration by the network
- **Benefits**: Better performance, cleaner code, more intelligent routing

## Testing

Run the test scripts to verify the implementation:

```bash
# Test network directly
npx tsx src/test-network.ts

# Test via client
npx tsx src/client-example.ts
```

## Configuration

The network is configured in `src/mastra/index.ts`:

```typescript
export const mastra = new Mastra({
  vnext_networks: {
    'omni-network': omniNetwork,
  },
  // ... other config
});
```

## Future Enhancements

1. **Custom Workflows**: Add domain-specific workflows
2. **Agent Specialization**: Further specialize agents for specific tasks
3. **Performance Optimization**: Optimize routing and memory usage
4. **Monitoring**: Add observability and performance metrics
5. **A/B Testing**: Test different routing strategies
