# Execution interfaces

- GET /api/agents exposes model-owned reasoningOptions/defaultReasoning.
- POST /api/runs and /api/chat accept reasoning alongside model. Unsupported known
  selections terminate with BAD_REQUEST before spawning; run transport retains its
  existing asynchronous status/events contract.
- POST /api/test/connection uses the same validation and reports invalid_reasoning.
- od run start / redesign --project ID --agent codex --model ID --reasoning ID
  --prompt-file path|- --json posts to /api/runs. Redesign starts another normal
  iteration in the supplied existing project.
- MCP list_agents returns /api/agents; start_run resolves project context and posts
  the shared request to /api/runs. Neither bypasses daemon validation.
