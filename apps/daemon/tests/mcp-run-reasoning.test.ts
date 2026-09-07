import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleMcpToolCall } from '../src/mcp.js';

afterEach(() => vi.unstubAllGlobals());
describe('MCP reasoning parity', () => {
  it('discovers model capabilities through the daemon', async () => {
    const data = { agents: [{ id: 'codex', models: [{ id: 'future', reasoningOptions: [{ id: 'deep-v2' }] }] }] };
    const fetchMock = vi.fn(async () => Response.json(data));
    vi.stubGlobal('fetch', fetchMock);
    const result = await handleMcpToolCall('http://localhost:18456', 'list_agents', {});
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:18456/api/agents');
    expect(JSON.parse(result.content[0]!.text)).toEqual(data);
  });
  it('forwards a future effort through the same run endpoint as CLI/UI', async () => {
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => url.endsWith('/api/active')
      ? Response.json({ active: true, projectId: 'p1' }) : Response.json({ runId: 'r1' }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await handleMcpToolCall('http://localhost:18457', 'start_run', {
      agentId: 'codex', model: 'gpt-6-astra', reasoning: 'deep-v2', message: 'Iterate on this design',
    });
    expect(JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body))).toEqual({
      projectId: 'p1', agentId: 'codex', model: 'gpt-6-astra', reasoning: 'deep-v2', message: 'Iterate on this design',
    });
    expect(JSON.parse(result.content[0]!.text)).toMatchObject({ runId: 'r1' });
  });
});
