# Overview

This is a Mastra-based AI agent stack that provides a comprehensive AI assistant with access to 500+ app integrations. The system implements a dynamic agent architecture that can adapt its behavior, model selection, and tool access based on runtime context. The main agent serves as an orchestrator that can delegate tasks to specialized sub-agents for research, email management, coding assistance, and personal organization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Framework
- **Mastra Framework**: TypeScript-based AI framework providing agent management, workflows, and integrations
- **Agent Architecture**: Multi-agent system with a main orchestrator and specialized sub-agents
- **Dynamic Configuration**: Agents adapt instructions, models, and tools based on runtime context
- **Memory System**: Persistent working memory across conversations using PostgreSQL storage

## Agent Design Patterns
- **Main Agent**: Comprehensive AI assistant that orchestrates tasks and delegates to specialists
- **Specialized Agents**: Research, Email, Coding, and Personal Assistant agents with domain-specific capabilities
- **Tool Integration**: Semantic storage/recall, web scraping, deep research, and self-learning capabilities
- **MCP Integration**: Access to external tools and services through Model Context Protocol

## Memory and Storage
- **PostgreSQL Storage**: Shared storage for persistent memory across all agents
- **Semantic Memory**: Vector embeddings for storing and retrieving contextually relevant information
- **Working Memory**: Thread-based memory that persists across conversations
- **Cross-Agent Memory**: Shared memory pool accessible by all agents

## Workflow Management
- **Inngest Integration**: Event-driven workflow orchestration with retry mechanisms
- **Assistant Workflow**: Multi-step workflow for processing messages and generating responses
- **Real-time Processing**: SSE-based real-time updates and streaming responses

## External Integrations
- **MCP Server**: Connection to rube.app MCP server for 500+ app integrations
- **Slack Integration**: Bot functionality with trigger-based message processing
- **Telegram Support**: Webhook-based message handling for Telegram bot
- **OpenAI Integration**: Multiple model support with dynamic model selection

# External Dependencies

## Core AI Services
- **OpenAI API**: GPT models for agent reasoning and embeddings for semantic search
- **OpenRouter**: Alternative AI model provider support

## Database and Storage
- **PostgreSQL**: Primary database for memory storage and agent state
- **LibSQL**: Alternative database support for development environments

## Workflow and Integration Services
- **Inngest**: Event-driven workflow orchestration and job processing
- **Rube.app MCP Server**: External service providing 500+ app integrations
- **Slack Web API**: Direct integration for Slack bot functionality
- **Exa.js**: Web search and research capabilities

## Development and Monitoring
- **Pino Logger**: Structured logging with configurable levels
- **OpenTelemetry**: Observability and tracing for production deployments
- **TypeScript**: Type safety and development experience
- **Mastra CLI**: Development tools and build system