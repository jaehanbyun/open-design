import { test, expect } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createReasoningCodex } from '../lib/codex-reasoning.js';
import { T } from '@/timeouts';

test('live Codex reasoning is discoverable and repairs a persisted selection', async ({ page }, testInfo) => {
  test.setTimeout(T.xlong * 2);
  const root = await mkdtemp(join(tmpdir(), 'od-reasoning-ui-'));
  try {
    const fixture = await createReasoningCodex(root);
    const saved = await page.request.put('/api/app-config', { data: {
      mode: 'daemon', agentId: 'codex', onboardingCompleted: true, locale: 'en',
      agentCliEnv: { codex: fixture.env },
      agentModels: { codex: { model: 'gpt-6-astra', reasoning: 'ultra' } },
    } });
    expect(saved.ok()).toBe(true);
    await page.goto('/');
    const chip = page.getByTestId('inline-model-switcher-chip');
    await expect(chip).toBeVisible({ timeout: T.xlong });
    await chip.click();
    const model = page.getByTestId('inline-model-switcher-agent-model');
    await expect(model).toHaveValue('gpt-6-astra', { timeout: T.long });
    const reasoning = page.getByTestId('inline-model-switcher-reasoning');
    await expect(reasoning).toHaveValue('ultra');
    await expect(reasoning.locator('option')).toHaveText(['Default', 'Low', 'Medium', 'High', 'XHigh', 'Max', 'Ultra', 'deep-v2']);
    await page.screenshot({ path: testInfo.outputPath('astra-reasoning.png'), fullPage: true });
    await model.selectOption('gpt-5.5');
    await expect(reasoning).toHaveValue('default');
    await expect(reasoning.locator('option')).toHaveText(['Default', 'Low', 'Medium', 'High', 'XHigh']);
    await page.screenshot({ path: testInfo.outputPath('model-switch-default.png'), fullPage: true });
    await page.reload();
    await chip.click();
    await expect(model).toHaveValue('gpt-5.5', { timeout: T.long });
    await expect(reasoning).toHaveValue('default');
  } finally {
    await page.request.put('/api/app-config', { data: { agentCliEnv: {}, agentModels: {} } });
    await rm(root, { recursive: true, force: true });
  }
});
