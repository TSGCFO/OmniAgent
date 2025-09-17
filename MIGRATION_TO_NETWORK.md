# Migration to Multi-Agent Architecture

This document describes the migration from the single agent setup to a multi-agent orchestration architecture.

## Overview

The new architecture uses an orchestrator agent that intelligently routes requests to specialized agents, providing better task handling and expertise.

## Key Changes

### 1. **Network-Based Architecture**
- **Before**: Individual agents managed separately with tool-based delegation
- **After**: Centralized `omniAgentNetwork` manages all agents and workflows

### 2. **Agent Registration**
- **Before**: Agents registered directly in `mastra.agents`
- **After**: AgentNetwork registered as a single agent in `mastra.agents`

### 3. **Routing**
- **Before**: Manual agent selection or tool-based delegation
- **After**: Intelligent LLM-based routing to the best specialized agent

### 4. **Tool Management**
- **Before**: Tools manually assigned to each agent
- **After**: Each agent brings its own tools, network inherits all

## Architecture Components

### OmniAgent Network (`src/mastra/network/index.ts`)
The central orchestrator that:
- Routes requests to appropriate agents
- Manages shared memory and context
- Dynamically loads tools (MCP + custom)
- Handles error recovery and retries

### Specialized Agents
1. **Research Agent**: Deep research, web scraping, information synthesis
2. **Email Agent**: Email composition, management, organization
3. **Coding Agent**: Code review, generation, technical assistance
4. **Personal Assistant**: Scheduling, reminders, general tasks

### How Routing Works
The network uses an LLM routing agent that:
1. Analyzes the user's request
2. Determines which specialized agent is best suited
3. Routes the request to that agent
4. Returns the agent's response

## Migration Steps Completed

1. ✅ Created `src/mastra/network/` directory structure
2. ✅ Implemented `omniAgentNetwork` with LLM-based routing
3. ✅ Configured specialized agents within the network
4. ✅ Updated `src/mastra/index.ts` to use `vnext_networks`
5. ✅ Modified `assistantWorkflow` to use network
6. ✅ Updated agent exports in `src/mastra/agents/index.ts`
7. ✅ Added environment variable validation
8. ✅ Simplified architecture to use standard AgentNetwork

## Usage Examples

### Basic Network Usage
```typescript
const response = await omniAgentNetwork.generate(
  [{ role: "user", content: "Research the latest AI trends" }],
  { 
    memory: { resource: "research", thread: "ai-trends" },
    maxSteps: 10
  }
);
```

### With Memory Support
```typescript
const response = await omniAgentNetwork.generate(
  [{ role: "user", content: "Continue our previous discussion" }],
  { 
    resourceId: "app",
    threadId: "conversation-123"
  }
);
```

## Benefits

1. **Better Scalability**: Easy to add new specialized agents
2. **Smart Routing**: Automatic selection of best agent
3. **Simplified Architecture**: One network managing multiple agents
4. **Tool Inheritance**: All agent tools available through network

## Notes

- The old `mainAgent` and `orchestratorAgent` are deprecated
- All agent interactions now go through the network
- Each agent maintains its own tools and capabilities
- The routing agent intelligently selects the best agent for each request
