/**
 * e2e/helpers/fixtures.ts — copy into the repo in PR-02.
 *
 * Every Studio spec runs in two modes:
 *   APP mode (default): against the running app (`npm run dev` with VITE_STUDIO_V2=true, VITE_STUDIO_API_MODE=mock).
 *   REF mode: against the handoff kit's reference.html files. Set STUDIO_REF_DIR=/path/to/cubit-studio-handoff.
 * The same data-testid contract (see _shared/TESTIDS.md) is used in both, so a spec that passes on the
 * reference and on your branch means the branch behaves like the approved design.
 */
import { test as base, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REF_DIR = process.env.STUDIO_REF_DIR ?? '';
export const isRef = REF_DIR !== '';

/** A screen = the same UI state reached two ways: a reference state name, or an app URL. */
export interface Screen {
  pr: string;        // 'PR-13'
  state: string;     // reference state name (the ref-bar "State" select)
  app: string;       // app URL that lands on the same state with the mock adapter
}

export type Role = 'educator' | 'admin' | 'learner';

/** Fake a signed-in session for APP mode. Studio v2 is admin-only, so the default role is admin. */
export async function mockSession(page: Page, role: Role = 'admin'): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('cuib_session_exp', String(Math.floor(Date.now() / 1000) + 3600));
  });
  await page.route('**/api/users/me', (route) =>
    route.fulfill({ json: { id: 'e2e-user', name: 'Priya Raman', email: 'priya@example.com', role } }),
  );
  // The shell also loads billing and enrollment stats. Stub them so a missing backend is not a console error.
  await page.route('**/api/users/me/**', (route) =>
    route.fulfill({ json: { total: 0, inProgress: 0, saved: 0, completed: 0, avgScore: 0 } }),
  );
  await page.route('**/api/billing/me', (route) =>
    route.fulfill({
      json: { plan: 'free', status: 'none', unlimited: false, canManageBilling: false },
    }),
  );
  // Home still requests quizzes after an educator or learner is sent away from Studio.
  await page.route('**/api/quizzes', (route) => route.fulfill({ json: [] }));
}

export async function open(page: Page, s: Screen, opts: { theme?: 'light' | 'dark' } = {}): Promise<void> {
  const theme = opts.theme ?? 'light';
  if (isRef) {
    const dir = fs.readdirSync(REF_DIR).find((d) => d.startsWith(`${s.pr}-`));
    if (!dir) throw new Error(`No reference folder for ${s.pr} in ${REF_DIR}`);
    await page.goto(`${pathToFileURL(path.join(REF_DIR, dir, 'reference.html')).href}?theme=${theme}`);
    await page.evaluate((name) => {
      const ref = (window as unknown as { __ref: { states: Record<string, unknown>; set(n: string): void } }).__ref;
      if (!ref.states[name]) throw new Error(`Unknown reference state: ${name}`);
      ref.set(name);
    }, s.state);
  } else {
    await page.addInitScript((t) => localStorage.setItem('quib_theme', t), theme);
    await page.goto(s.app);
  }
  await page.waitForTimeout(200);
}

/** Reference-only helper: jump to another named state (no-op in APP mode, where specs click instead). */
export async function refState(page: Page, name: string): Promise<void> {
  if (!isRef) return;
  await page.evaluate((n) => (window as unknown as { __ref: { set(n: string): void } }).__ref.set(n), name);
  await page.waitForTimeout(150);
}

/** Fails the test on any console error or uncaught exception. */
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    if (!isRef) await mockSession(page);
    await use(page);
    expect(errors, 'console errors / page errors').toEqual([]);
  },
});
export { expect };

export const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } as const;
export const DESKTOP = { viewport: { width: 1440, height: 960 } } as const;

/** Send a chat message and wait for the AI reply (mock adapter: 300–600 ms). */
export async function say(page: Page, text: string): Promise<void> {
  const before = await page.getByTestId('msg-ai').count();
  await page.getByTestId('composer-input').fill(text);
  await page.getByTestId('composer-input').press('Enter');
  await expect(page.getByTestId('msg-ai')).toHaveCount(before + 1, { timeout: 5000 });
  await expect(page.getByTestId('thinking')).toHaveCount(0, { timeout: 5000 });
}
