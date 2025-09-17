# Migration to Multi-Agent Architecture

This document describes the migration from the single agent setup to a multi-agent orchestration architecture.

## Overview

The new architecture uses an orchestrator agent that intelligently routes requests to specialized agents, providing better task handling and expertise.

## Key Changes

### 1. **Orchestrator-Based Architecture**
- **Before**: Single agent handling all requests
- **After**: Orchestrator agent routing to specialized agents

### 2. **Agent Registration**
- **Before**: Single agent in `mastra.agents`
- **After**: Multiple agents (orchestrator + specialized) in `mastra.agents`

### 3. **Routing**
- **Before**: No routing needed (single agent)
- **After**: Orchestrator uses delegateToSubAgent tool for routing

### 4. **Tool Management**
- **Before**: Tools assigned to single agent
- **After**: All agents have access to full tool suite

## Architecture Components

### Orchestrator Agent (`src/mastra/agents/orchestratorAgent.ts`)
The central orchestrator that:
- Analyzes incoming requests
- Routes to specialized agents via delegation tool
- Manages the overall response flow
- Handles complex multi-domain tasks

### Specialized Agents
1. **Research Agent**: Deep research, web scraping, information synthesis
2. **Email Agent**: Email composition, management, organization
3. **Coding Agent**: Code review, generation, technical assistance
4. **Personal Assistant**: Scheduling, reminders, general tasks

### How Delegation Works
The orchestrator uses the `delegateToSubAgent` tool to:
1. Analyze the user's request
2. Determine which specialized agent is best suited
3. Call the delegation tool with the agent type and task
4. Return the specialized agent's response

## Migration Steps Completed

1. ✅ Created orchestrator agent with routing logic
2. ✅ Created specialized agents (research, email, coding, personal)
3. ✅ Implemented delegation tool for agent routing
4. ✅ Updated `src/mastra/index.ts` to register all agents
5. ✅ Modified `assistantWorkflow` to use orchestrator
6. ✅ Set up tool initialization for all agents
7. ✅ Added environment variable validation

## Usage Examples

### Basic Orchestrator Usage
```typescript
const response = await orchestratorAgent.generate(
  [{ role: "user", content: "Research the latest AI trends" }],
  {
    maxSteps: 10,
    onStepFinish: ({ toolCalls }) => {
      console.log("Tools used:", toolCalls);
    }
  }
);
```

### Direct Agent Access
```typescript
// You can also bypass the orchestrator for specific tasks
const researchAgent = mastra.getAgent("researchAgent");
const response = await researchAgent.generate(
  [{ role: "user", content: "Research quantum computing" }],
  { maxSteps: 5 }
);
```

### Complex Multi-Domain Tasks
```typescript
const response = await orchestratorAgent.generate(
  [{ 
    role: "user", 
    content: "Research API security best practices, write an email summary, and create example code"
  }],
  { 
    maxSteps: 15,
    resourceId: "multi-task",
    threadId: "complex-001"
  }
);
```

## Benefits

1. **Better Task Handling**: Specialized agents for different domains
2. **Smart Routing**: Orchestrator intelligently delegates tasks
3. **Tool Access**: All agents have access to full tool suite
4. **Flexibility**: Can use orchestrator or access agents directly
5. **Scalability**: Easy to add new specialized agents

## Notes

- The old single `mainAgent` is replaced by the multi-agent system
- Orchestrator handles routing via the delegation tool
- All agents have access to the same tool set
- UI may only display one agent at a time due to current limitations
- Each agent has its own memory for maintaining context
