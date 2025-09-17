# Environment Setup Guide

This guide will help you set up the required environment variables for the OmniAgent project.

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

### 1. Database Configuration (Required)

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

**Example:**

```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/omniagent
```

**Setup PostgreSQL:**

1. Install PostgreSQL if not already installed
2. Create a new database:

   ```sql
   CREATE DATABASE omniagent;
   ```

3. The application will automatically set up required tables and extensions

### 2. OpenAI API Key (Required)

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: <https://platform.openai.com/api-keys>

### 3. OpenAI Base URL (Optional)

```env
OPENAI_BASE_URL=https://api.openai.com/v1
```

Only set this if you're using a custom OpenAI-compatible endpoint.

### 4. Slack Integration (Optional)

If you want to use the Slack bot functionality:

```env
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
```

**Setup Slack App:**

1. Go to <https://api.slack.com/apps>
2. Create a new app
3. Add bot user and get bot token
4. Get signing secret from Basic Information
5. Set up event subscriptions to your server URL

### 5. MCP Server (Optional)

For additional tool integrations:

```env
MCP_SERVER_URL=your-mcp-server-url
MCP_API_KEY=your-mcp-api-key
```

## Complete Example `.env` File

```env
# Required
DATABASE_URL=postgresql://postgres:[your password]@localhost:5432/omniagent
OPENAI_API_KEY=<your-key>

# Optional - OpenAI Configuration
# OPENAI_BASE_URL=https://api.openai.com/v1

# Optional - Slack Integration
# SLACK_BOT_TOKEN=<bot-token>
# SLACK_SIGNING_SECRET=<your-secret>

# Optional - MCP Server
# MCP_SERVER_URL=http://localhost:3000
# MCP_API_KEY=your-mcp-api-key

# Optional - Node Environment
NODE_ENV=development
```

## Important Notes

1. **Never commit `.env` file to version control** - it's already in `.gitignore`
2. **Database must be accessible** before starting the application
3. **OpenAI API key must be valid** - the app will fail to start without it
4. **Slack tokens are optional** - only needed if using Slack integration

## Troubleshooting

### Database Connection Error

```
❌ DATABASE_URL environment variable is not set!
```

**Solution:** Create `.env` file with valid `DATABASE_URL`

### PostgreSQL Connection Refused

```
Error: connect ECONNREFUSED
```

**Solution:** Ensure PostgreSQL is running:

- Windows: Check Services for PostgreSQL
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### OpenAI API Error

```
Error: Invalid API Key
```

**Solution:** Verify your OpenAI API key is correct and has credits

## Next Steps

After setting up your `.env` file:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Access the Mastra Playground at:

   ```
   http://localhost:5000
   ```
