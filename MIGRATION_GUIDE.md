# Migration Guide: Tool-based Delegation to vNext AgentNetwork

This guide explains how to migrate from the previous tool-based delegation pattern to the new vNext AgentNetwork architecture.

## Overview of Changes

### Before (Tool-based Delegation)
- Main agent with `delegateToSubAgent` tool
- Manual routing through tool calls
- Individual agent instances not registered in Mastra
- Tool loading through mutation after agent creation

### After (vNext AgentNetwork)
- Single network coordinator with intelligent routing
- Automatic LLM-based task distribution
- All agents registered within the network
- Dynamic tool loading through function-based configuration

## Key Changes Made

### 1. Network Structure
**File**: `src/mastra/network/omni-network.ts`

- Created `NewAgentNetwork` with all specialized agents
- Added workflows for complex multi-agent tasks
- Implemented shared memory across all agents
- Dynamic tool loading with MCP integration

### 2. Mastra Configuration
**File**: `src/mastra/index.ts`

**Before**:
```typescript
export const mastra = new Mastra({
  agents: {
    mainAgent,
  },
  // ... other config
});
```

**After**:
```typescript
export const mastra = new Mastra({
  vnext_networks: {
    'omni-network': omniNetwork,
  },
  // ... other config
});
```

### 3. Workflow Updates
**File**: `src/mastra/workflows/assistantWorkflow.ts`

**Before**:
```typescript
const { text } = await mainAgent.generate([
  { role: "user", content: inputData.message }
], {
  resourceId: "slack-bot",
  threadId: inputData.threadId,
  maxSteps: 10,
});
```

**After**:
```typescript
const network = mastra?.getNetwork('omni-network');
const result = await network.generate(inputData.message, {
  memory: {
    resource: "slack-bot",
    thread: inputData.threadId,
  },
  maxSteps: 10,
});
```

### 4. Tool Loading
**Before**:
```typescript
// Mutation after agent creation
Object.assign(mainAgent.tools, allTools);
```

**After**:
```typescript
// Dynamic tool loading in network
tools: async () => {
  const mcpTools = await getMCPTools();
  return {
    ...mcpTools,
    semanticStorage,
    semanticRecall,
    // ... other tools
  };
},
```

## Migration Steps

### Step 1: Update Imports
Replace imports of individual agents with network imports:

```typescript
// Before
import { mainAgent } from "./agents";

// After
import { omniNetwork } from "./network/omni-network";
```

### Step 2: Update Agent Access
Replace direct agent calls with network calls:

```typescript
// Before
const result = await mainAgent.generate(message, options);

// After
const network = mastra.getNetwork('omni-network');
const result = await network.generate(message, options);
```

### Step 3: Update Memory Configuration
Update memory configuration to use the new format:

```typescript
// Before
{
  resourceId: "user-123",
  threadId: "conversation-1",
}

// After
{
  memory: {
    resource: "user-123",
    thread: "conversation-1",
  },
}
```

### Step 4: Remove Delegation Tools
Remove the `delegateToSubAgent` tool and related delegation logic:

```typescript
// Remove this tool
export const delegateToSubAgent = createTool({
  // ... delegation logic
});
```

### Step 5: Update Client Code
Update client-side code to use the network:

```typescript
// Before
const agent = client.getAgent("mainAgent");

// After
const network = client.getNetwork("omni-network");
```

## Benefits of Migration

### 1. Intelligent Routing
- Automatic task distribution based on content analysis
- No need for manual delegation decisions
- Better handling of complex multi-domain tasks

### 2. Improved Performance
- Reduced token usage through optimized routing
- Better memory management across agents
- More efficient tool loading

### 3. Enhanced Capabilities
- Workflows for complex multi-step tasks
- Better coordination between agents
- Shared context and memory

### 4. Cleaner Architecture
- Single entry point for all AI capabilities
- Centralized configuration and management
- Easier to maintain and extend

## Testing the Migration

### 1. Run Network Tests
```bash
npx tsx src/test-network.ts
```

### 2. Test Client Integration
```bash
npx tsx src/client-example.ts
```

### 3. Test Slack Integration
Send messages to your Slack bot to verify the workflow still works.

## Rollback Plan

If you need to rollback:

1. Revert `src/mastra/index.ts` to use `agents` instead of `vnext_networks`
2. Restore the `delegateToSubAgent` tool
3. Update workflow to use `mainAgent` directly
4. Restore tool loading logic

## Common Issues and Solutions

### Issue: Network not found
**Solution**: Ensure the network is properly registered in Mastra configuration

### Issue: Memory configuration errors
**Solution**: Use the new memory format with `resource` and `thread` properties

### Issue: Tool loading failures
**Solution**: Check MCP server connection and tool availability

### Issue: Agent routing not working as expected
**Solution**: Review network instructions and agent descriptions for better routing

## Next Steps

1. **Monitor Performance**: Track response times and token usage
2. **Optimize Instructions**: Refine network instructions based on usage patterns
3. **Add Workflows**: Create additional workflows for common task patterns
4. **Enhance Memory**: Improve memory templates and recall strategies
5. **Add Monitoring**: Implement observability for network performance

## Support

If you encounter issues during migration:

1. Check the logs for error messages
2. Verify all dependencies are installed
3. Ensure environment variables are set correctly
4. Test with simple queries first
5. Review the network configuration

The new architecture provides a more robust, scalable, and intelligent foundation for your multi-agent system.
