# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Mastra-based AI agent stack — a multi-agent AI assistant platform. See `replit.md` for architecture details.

### Required secrets (environment variables)

- `DATABASE_URL` — Neon PostgreSQL connection string (with `?sslmode=require`)
- `OPENAI_API_KEY` — OpenAI API key for GPT-5 and embeddings
- `RUBE_MCP_TOKEN` — (optional) Auth token for rube.app MCP server

### Running services

Two services must run for the full dev experience:

1. **Mastra dev server** (port 5000): `npx mastra dev` — serves the agent API, Mastra Playground UI, and Inngest integration route. The `--port` flag is deprecated; port is configured in `src/mastra/index.ts` server config.
2. **Inngest dev server** (port 3000): `npx inngest-cli dev -u http://localhost:5000/api/inngest --host 127.0.0.1 --port 3000` — workflow orchestration engine. Start this before or in parallel with Mastra.

Both should be started as background processes. The Mastra server may take ~5-10 seconds to load MCP tools from rube.app on startup.

### Lint / type-check / format

- Type check: `npx tsc --noEmit` (pre-existing error in `src/test-working-memory.ts` — not blocking)
- Format check: `npx prettier --check '**/*.ts'` (pre-existing formatting issues in 17 files)
- Format fix: `npm run format`
- No automated test suite is configured (`npm test` is a no-op stub)

### Gotchas

- The `scripts/inngest.sh` has a logic bug (reversed `-z` condition) and uses Replit-specific paths. Run `inngest-cli` directly instead.
- The Mastra dev server binds to `0.0.0.0:5000` and the Playground UI is at the root `/`.
- No local PostgreSQL is needed — `DATABASE_URL` points to a hosted Neon instance.
- The agent uses `openai.responses("gpt-5")` which requires an API key with access to GPT-5.
