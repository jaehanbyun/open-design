# Validation and completion

Baseline: `origin/main` / `2dfb3b9aa`. Node 24.11.1, Corepack pnpm 10.33.2.

## Spec Kit analysis

The specify/clarify/plan/tasks analysis covered all eight requirements before
implementation. No critical ambiguity or governance conflict remained. The current
checkout's missing MCP run tool/redesign alias was made explicit in the spec.

| Requirement | Tasks | Evidence |
| --- | --- | --- |
| FR-001–003 | T002–004 | Catalogue parser fixtures, live installed catalogue |
| FR-004 | T005 | Inline/avatar component tests, settings test, browser screenshot |
| FR-005 | T006 | Preference tests, settings autosave, browser switch/reload |
| FR-006 | T007–008 | Real daemon HTTP and actual fixture child argv |
| FR-007 | T009–010 | CLI file/stdin and MCP HTTP forwarding tests |
| FR-008 | T002, T007–008 | Legacy/malformed/custom metadata and clamp tests |

Coverage: 8/8 requirements; no unmapped tasks; no unresolved critical/high findings.
Root and module AGENTS.md ownership/contract rules and the repository review guide
were checked. No Spec Kit hooks exist in this repository.

## Red before implementation

- Catalogue/default preservation, malformed/empty metadata, and stale minimal clamp:
  four tests failed against the original source before changes.
- Inline/avatar model-specific options: two tests failed before picker changes.
- CLI/MCP reasoning forwarding: four tests failed before those surfaces were added.

Original logs are preserved in `.context/reasoning-5402/red-*.log`.

## Passing checks

- `pnpm install --frozen-lockfile` (including after CLI changes); lockfile unchanged.
- `pnpm guard` and `pnpm typecheck` across the workspace.
- `pnpm --filter @open-design/daemon build`.
- `pnpm --filter @open-design/web build`.
- Daemon runtime/CLI/MCP group: 162 passed, one existing skipped test.
- Web picker/preferences/Settings execution group: 91 passed.
- Daemon connection/chat/MCP-write group: 141 passed, one baseline failure below.
- `pnpm --dir e2e test tests/codex/reasoning.test.ts`: passed.
- `pnpm --dir e2e exec playwright test -c playwright.config.ts codex-reasoning.test.ts`: passed.
- `git diff --check`.

Focused daemon group:
`pnpm --filter @open-design/daemon test tests/runtimes tests/run-reasoning-cli.test.ts tests/mcp-run-reasoning.test.ts tests/mcp-spawn.test.ts`

Web group:
`pnpm --filter @open-design/web test tests/components/model-reasoning.test.tsx tests/runtime/agent-reasoning.test.ts tests/components/SettingsDialog.execution.test.tsx`

Adjacent daemon group:
`pnpm --filter @open-design/daemon test tests/connection-test.test.ts tests/chat-route.test.ts tests/mcp-write-tools.test.ts`

## Execution and visual evidence

The HTTP smoke starts an isolated tools-dev namespace and configures an executable
fixture through production `/api/app-config`. Before any model-picker request, an
Astra run forwards `model_reasoning_effort="deep-v2"` to the real child process.
A GPT-5.5/ultra run fails without spawning that model. A Sol/max connection test
forwards the requested effort, while an incompatible connection test reports
`invalid_reasoning`. Background daemon title/summary calls are observed separately
from the project run and connection test.

The browser test seeds only production HTTP configuration (no route mocks), shows
the home entry point with Astra/Ultra selected, switches to GPT-5.5/Default, and
verifies the saved choice after reload. Screenshots were visually inspected:

- [Home model picker with Astra/Ultra](images/astra-reasoning.png)
- [Model switch reconciled to Default](images/model-switch-default.png)

The installed Codex CLI 0.153.4 catalogue was also passed through the implemented
parser. Sol and Astra retain low/medium/high/xhigh/max/ultra, with default low and
medium respectively. See `.context/reasoning-5402/live-catalogue.json`.

All tool/runtime test namespaces are stopped by their harnesses. No paid model
generation or user-global Codex configuration change was required.

For manual acceptance, the branch was also started with `pnpm tools-dev start web`
in the `reasoning-5402` namespace against the real installed Codex CLI. A browser
check confirmed Astra/XHigh and the Default/Low/Medium/High/XHigh/Max/Ultra options.
The requester inspected the running application and confirmed acceptance on
2026-09-07. This review runtime remains running separately from the test harnesses.

## Adjacent baseline failure

`apps/daemon/tests/connection-test.test.ts:2555`, “reports an early-phase diagnostics
block when the agent CLI is missing (#2248)”, expects binary_resolution/spawn but
observes output_parse on this machine. The identical test was run in a separate
detached worktree at origin/main and failed with the same assertion. This is not a
new regression; changing unrelated executable-resolution diagnostics is outside
#5402. Compare `.context/reasoning-5402/routes-tests.log` with
`.context/reasoning-5402/baseline-connection.log`. The temporary worktree was removed.

## Compatibility limits

Model metadata drives new options when supplied by the installed CLI. Old CLIs,
custom models absent from the catalogue, or unusable metadata use the documented
legacy fallback. Default still delegates to CLI configuration; the advertised
default is descriptive metadata, not an override of the user's CLI settings.
