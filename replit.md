# replit.md

## Overview

This is a Mastra-based AI agent system that provides comprehensive AI assistance through multiple specialized agents. The system uses a modern TypeScript architecture with PostgreSQL storage, semantic memory capabilities, and integration with 500+ external services through MCP (Model Context Protocol) servers. The core functionality revolves around dynamic agent orchestration, where a main agent can delegate tasks to specialized sub-agents (research, email, coding, personal assistant) based on the specific requirements of each request.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Agent Architecture
The system implements a hierarchical agent structure with a main orchestrator agent and specialized sub-agents:

- **Main Agent**: Central orchestrator that routes requests to appropriate specialized agents
- **Research Agent**: Handles deep research, web scraping, and information synthesis
- **Email Agent**: Manages email composition, organization, and communication
- **Coding Agent**: Provides programming assistance, code reviews, and technical support
- **Personal Assistant**: Handles scheduling, reminders, and personal organization

### Memory System
The architecture includes sophisticated semantic memory capabilities:

- **Semantic Storage**: Uses OpenAI text-embedding-3-small to create vector embeddings for content storage
- **Semantic Recall**: Implements cosine similarity search for retrieving relevant past interactions
- **PostgreSQL Integration**: Uses pgvector extension for efficient vector operations and storage
- **Working Memory**: Persistent memory across conversations with automatic updates based on learned user preferences

### Tool System
The system provides an extensive tool ecosystem:

- **Custom Tools**: Web scraping, deep research, self-learning, semantic storage/recall, agent delegation
- **MCP Integration**: Access to 500+ external services through rube.app MCP server including GitHub, Gmail, Outlook, AWS, Azure, and productivity tools
- **Dynamic Tool Loading**: Runtime loading of MCP tools with fallback handling

### Workflow Engine
Built on Inngest for reliable workflow execution:

- **Event-Driven Architecture**: Uses Inngest for workflow orchestration and step management
- **Realtime Updates**: Integrates @inngest/realtime for live workflow monitoring
- **Multi-Step Processing**: Supports complex workflows with tool chaining and agent coordination
- **Error Handling**: Implements retry logic and graceful failure management

### Storage Layer
PostgreSQL-based storage with vector capabilities:

- **Shared Storage**: Centralized PostgreSQL instance using @mastra/pg
- **Vector Operations**: pgvector extension for semantic similarity operations
- **Connection Pooling**: Shared database pool for efficient resource management
- **Schema Management**: Automated table creation and migration handling

### Integration Layer
Multiple integration pathways for external services:

- **Slack Integration**: Real-time message processing and response workflows
- **Telegram Integration**: Bot functionality with webhook support
- **MCP Protocol**: Standardized integration with 500+ external services
- **API Routes**: RESTful endpoints for external system communication

### Development Environment
Modern TypeScript development stack:

- **TypeScript**: ES2022 target with bundler module resolution
- **Build System**: Mastra CLI for development and production builds
- **Hot Reload**: Development server with live reloading capabilities
- **Code Quality**: Prettier formatting and TypeScript checking

## External Dependencies

### Core Framework
- **@mastra/core**: Primary framework for agent orchestration and workflow management
- **@mastra/inngest**: Workflow engine integration with event-driven processing
- **@mastra/pg**: PostgreSQL integration layer with vector support
- **@mastra/memory**: Semantic memory system for persistent learning

### AI/ML Services
- **OpenAI**: Primary language model provider (GPT-4/GPT-3.5-turbo) and embeddings (text-embedding-3-small)
- **@ai-sdk/openai**: OpenAI SDK integration for model inference
- **@openrouter/ai-sdk-provider**: Alternative model provider for routing flexibility

### Database & Storage
- **PostgreSQL**: Primary database with pgvector extension for vector operations
- **@mastra/libsql**: Additional database support for SQLite compatibility
- **pg**: Direct PostgreSQL driver for custom queries and connection management

### External Integrations
- **rube.app MCP Server**: Access to 500+ app integrations including GitHub, Gmail, productivity tools
- **@slack/web-api**: Slack workspace integration for real-time messaging
- **exa-js**: Advanced web search capabilities for research functionality

### Workflow & Processing
- **Inngest**: Event-driven workflow orchestration with retry and monitoring
- **@inngest/realtime**: Live workflow status updates and monitoring
- **ai**: Universal AI SDK for model abstraction and tool integration

### Development Tools
- **TypeScript**: Type safety and modern JavaScript features
- **tsx**: TypeScript execution for development workflows
- **Prettier**: Code formatting and style consistency
- **Mastra CLI**: Framework-specific development and build tools

### Utilities
- **zod**: Runtime type validation and schema definition
- **dotenv**: Environment variable management
- **pino**: High-performance logging with structured output