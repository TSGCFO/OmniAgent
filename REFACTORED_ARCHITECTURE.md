# OmniAgent System v2 - Refactored Architecture

This document describes the completely refactored OmniAgent system using Mastra's vNext AgentNetwork architecture.

## 🏗️ Architecture Overview

The refactored system is built around a unified, intelligent multi-agent network that seamlessly coordinates specialized agents to provide comprehensive AI assistance.

### Core Components

1. **OmniAgent Network v2** - Central coordinator using vNext AgentNetwork
2. **Unified Memory System** - Shared memory across all agents and workflows
3. **Refactored Agents** - Optimized specialized agents with network compatibility
4. **Advanced Workflows** - Multi-step workflows for complex tasks
5. **Enhanced Tools** - Improved tools with network integration

## 📁 File Structure

```
src/mastra/
├── network/
│   ├── omni-network-v2.ts          # Main network coordinator
│   └── README.md                    # Network documentation
├── agents/
│   ├── refactored/                  # Refactored agents
│   │   ├── researchAgent.ts
│   │   ├── emailAgent.ts
│   │   ├── codingAgent.ts
│   │   └── personalAssistant.ts
│   └── [legacy agents]              # Old agents (can be removed)
├── memory/
│   └── unified-memory.ts            # Unified memory system
├── tools/
│   ├── refactored/                  # Refactored tools
│   │   ├── semanticStorage.ts
│   │   └── semanticRecall.ts
│   └── [legacy tools]               # Old tools (can be removed)
└── index.ts                         # Updated Mastra configuration
```

## 🔄 Key Improvements

### 1. Unified Memory System
- **Shared Context**: All agents share the same memory instance
- **Specialized Templates**: Each agent has tailored memory templates
- **Enhanced Metadata**: Rich metadata for better organization
- **Cross-Agent Learning**: Agents learn from each other's interactions

### 2. Refactored Agents
- **Network-Optimized**: Designed specifically for network coordination
- **Clear Instructions**: Focused, actionable instructions for each agent
- **Memory Integration**: Seamless integration with unified memory
- **Collaboration Ready**: Built for multi-agent coordination

### 3. Advanced Workflows
- **Multi-Step Processes**: Complex tasks broken into logical steps
- **Agent Coordination**: Workflows that use multiple agents
- **Quality Assurance**: Built-in verification and fact-checking
- **Flexible Routing**: Dynamic agent selection within workflows

### 4. Enhanced Tools
- **Network-Aware**: Tools designed for network usage
- **Rich Metadata**: Enhanced categorization and tagging
- **Better Search**: Improved semantic search capabilities
- **Performance Optimized**: Faster and more efficient operations

## 🚀 Usage Examples

### Basic Usage
```typescript
import { mastra } from './mastra';

const network = mastra.getNetwork('omni-network');

// Simple task
const result = await network.generate("Help me with my project", {
  memory: {
    resource: "user-123",
    thread: "project-help",
  },
});
```

### Complex Multi-Domain Task
```typescript
const result = await network.generate(
  "Research quantum computing, write an email about it, and create a coding project plan",
  {
    memory: {
      resource: "user-123",
      thread: "quantum-project",
    },
    maxSteps: 15,
  }
);
```

### Workflow Usage
```typescript
const result = await network.generate(
  "Use the advanced research workflow to analyze renewable energy trends",
  {
    memory: {
      resource: "user-123",
      thread: "research-analysis",
    },
    maxSteps: 20,
  }
);
```

## 🧪 Testing

### Run All Tests
```bash
# Test the refactored system
npm run test:refactored

# Verify cleanup and functionality
npm run cleanup:verify

# Test basic network functionality
npm run test:network

# Test client integration
npm run test:client
```

### Test Coverage
- ✅ Basic agent routing
- ✅ Memory persistence
- ✅ Multi-agent coordination
- ✅ Advanced workflows
- ✅ Tool integration
- ✅ Network orchestration

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_postgres_url

# Optional
OPENAI_BASE_URL=your_custom_endpoint
MASTRA_BASE_URL=http://localhost:5000
```

### Memory Configuration
The unified memory system uses:
- **PostgreSQL** for storage
- **PgVector** for vector operations
- **OpenAI embeddings** for semantic search
- **Shared templates** for consistency

## 📊 Performance Improvements

### Before (Tool-based Delegation)
- Manual routing through tools
- Separate memory instances
- Limited coordination
- Tool loading through mutation
- Inconsistent quality

### After (vNext AgentNetwork)
- Automatic intelligent routing
- Unified memory system
- Seamless multi-agent coordination
- Dynamic tool loading
- Consistent high quality

## 🎯 Benefits

1. **Intelligence**: LLM-based routing for optimal agent selection
2. **Efficiency**: Reduced token usage and faster responses
3. **Quality**: Consistent high-quality outputs across all agents
4. **Scalability**: Easy to add new agents and workflows
5. **Maintainability**: Cleaner, more organized codebase
6. **Memory**: Shared context and learning across agents
7. **Flexibility**: Supports both simple and complex tasks

## 🔄 Migration from v1

### What Changed
- Replaced tool-based delegation with AgentNetwork
- Unified memory system across all agents
- Refactored agent instructions for network compatibility
- Enhanced tools with better metadata
- Added advanced workflows for complex tasks

### What Stayed the Same
- All existing functionality preserved
- Same API interface for basic usage
- Compatible with existing integrations
- Same memory and storage systems

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Test the System**
   ```bash
   npm run test:refactored
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📈 Future Enhancements

1. **Custom Workflows**: Add domain-specific workflows
2. **Agent Specialization**: Further specialize agents for specific tasks
3. **Performance Monitoring**: Add observability and metrics
4. **A/B Testing**: Test different routing strategies
5. **Memory Optimization**: Improve memory efficiency and recall
6. **Tool Expansion**: Add more specialized tools

## 🛠️ Development

### Adding New Agents
1. Create agent in `src/mastra/agents/refactored/`
2. Add to network in `src/mastra/network/omni-network-v2.ts`
3. Update memory templates if needed
4. Test with `npm run test:refactored`

### Adding New Workflows
1. Create workflow in `src/mastra/network/omni-network-v2.ts`
2. Add to network workflows
3. Test workflow functionality
4. Update documentation

### Adding New Tools
1. Create tool in `src/mastra/tools/refactored/`
2. Add to network tools
3. Test tool integration
4. Update agent instructions if needed

## 📞 Support

For issues or questions:
1. Check the test results: `npm run test:refactored`
2. Verify configuration: `npm run cleanup:verify`
3. Review logs for error messages
4. Check environment variables
5. Ensure all dependencies are installed

The refactored system provides a robust, scalable, and intelligent foundation for multi-agent AI assistance.
