# OmniAgent - Advanced Multi-Agent AI System

A sophisticated multi-agent AI system built with Mastra, featuring an intelligent orchestrator that routes requests to specialized agents for research, email, coding, and personal assistance.

## 🚀 Features

- **Multi-Agent Network**: 4 specialized AI agents working in concert
- **Advanced Workflows**: Complex multi-step operations for deep tasks  
- **Dynamic Tool Loading**: 500+ integrations via MCP + custom tools
- **Shared Memory**: PostgreSQL-backed memory with vector search
- **Intelligent Routing**: Automatic selection of best agent for each task
- **Slack Integration**: Built-in Slack bot for team collaboration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key
- (Optional) Slack app credentials

## 🛠️ Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd OmniAgent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```env
   # Required
   DATABASE_URL=postgresql://postgres:password@localhost:5432/omniagent
   OPENAI_API_KEY=sk-your-openai-api-key
   
   # Optional - Slack Integration
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_SIGNING_SECRET=your-slack-signing-secret
   ```
   
   See [ENV_SETUP.md](ENV_SETUP.md) for detailed setup instructions.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the Mastra Playground**
   Open http://localhost:5000 in your browser

## 🏗️ Architecture

The system uses an orchestrator-based multi-agent architecture:

```
┌─────────────────────────────────────────┐
│         Orchestrator Agent              │
│  ┌─────────────────────────────────┐   │
│  │  Analyzes requests & delegates  │   │
│  └──────────┬──────────────────────┘   │
│             │ delegateToSubAgent        │
│  ┌──────────┴──────────┐               │
│  │                     │               │
│  ▼                     ▼               │
│ Specialized Agents     Tools           │
│ ├─ Research Agent     ├─ Web Scraper  │
│ ├─ Email Agent       ├─ Deep Research │
│ ├─ Coding Agent      ├─ Semantic Memory│
│ └─ Personal Assistant└─ MCP Tools     │
│                                        │
│  ┌─────────────────────────────────┐   │
│  │     Memory (PostgreSQL)          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🤖 Specialized Agents

- **Research Agent**: Deep research, web scraping, information synthesis
- **Email Agent**: Professional email composition and management
- **Coding Agent**: Code generation, review, and technical assistance
- **Personal Assistant**: General tasks, scheduling, and organization

## 🔧 Advanced Features

- **Memory Persistence**: Conversations and context saved across sessions
- **Tool Integration**: Access to 500+ app integrations via MCP
- **Workflow Orchestration**: Complex multi-step operations
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Real-time Updates**: WebSocket support for live interactions

## 📖 Documentation

- [Migration Guide](MIGRATION_TO_MULTI_AGENT.md) - Details on the multi-agent architecture
- [Environment Setup](ENV_SETUP.md) - Complete setup instructions
- [Usage Examples](src/examples/multi-agent-usage.ts) - Code examples

## 🧪 Examples

### Basic Usage
```typescript
import { orchestratorAgent } from "./src/mastra/agents/orchestratorAgent";

const response = await orchestratorAgent.generate(
  [{ role: "user", content: "Research the latest AI trends" }],
  { 
    resourceId: "my-app",
    threadId: "research-001",
    maxSteps: 10
  }
);
```

### Slack Integration
The system automatically responds to:
- Direct messages to the bot
- Mentions in channels where the bot is present

## 🛠️ Development

### Project Structure
```
OmniAgent/
├── src/
│   ├── mastra/
│   │   ├── network/      # AgentNetwork configuration
│   │   ├── agents/       # Individual agent definitions
│   │   ├── workflows/    # Workflow definitions
│   │   └── tools/        # Custom tools
│   └── examples/         # Usage examples
├── .env                  # Environment variables
└── package.json
```

### Adding New Agents
1. Create agent file in `src/mastra/agents/`
2. Export from `src/mastra/agents/index.ts`  
3. Add to network in `src/mastra/network/index.ts`
4. Update routing instructions

### Creating Workflows
1. Define workflow in `src/mastra/network/workflows/`
2. Register in network configuration
3. Test via playground or examples

## 🔒 Security

- Environment variables for sensitive data
- PostgreSQL for secure data storage
- Encrypted API communications
- Slack signature verification

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contributing Guidelines]

## 💬 Support

[Your Support Information]
