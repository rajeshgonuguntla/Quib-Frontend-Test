import { test, expect, open, isRef, PHONE } from '../helpers/fixtures';
import { expectNoStrayAccent, expectNoHorizontalOverflow } from '../helpers/designGuards';

const SEEDED = { pr: 'PR-03', state: 'Two panes (chat expanded)', app: '/educator-studio/sat-math-sprint' };
const EMPTY = { pr: 'PR-03', state: 'Empty state (no toggle)', app: '/educator-studio' };

test.describe('PR-03 · Studio layout and chat collapse', () => {
  test('two panes: chat + live preview; no New course button', async ({ page }) => {
    await open(page, SEEDED);
    await expect(page.getByTestId('chat')).toBeVisible();
    await expect(page.getByTestId('preview')).toBeVisible();
    await expect(page.getByTestId('studio-course-title')).toHaveText('SAT Math Sprint');
    await expect(page.getByTestId('studio').getByRole('button', { name: /new course/i })).toHaveCount(0);
    await expect(page.getByTestId('app-sidebar')).toHaveCount(0); // full-bleed workspace
  });

  test('edge toggle collapses chat to a rail and persists', async ({ page }) => {
    await open(page, SEEDED);
    const t = page.getByTestId('chat-toggle');
    await expect(t).toHaveAttribute('aria-expanded', 'true');
    await expect(t).toHaveAccessibleName('Collapse chat');
    await t.click();
    await expect(t).toHaveAttribute('aria-expanded', 'false');
    await expect(t).toHaveAccessibleName('Expand chat');
    await expect(page.getByTestId('studio-body')).toHaveClass(/chat-collapsed/);
    await expect.poll(() => page.getByTestId('chat').evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(48);
    const stored = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('cubit_studio_v1:')).map((k) => JSON.parse(localStorage.getItem(k)!).ui.chatCollapsed));
    expect(stored).toContain(true);
    if (!isRef) {
      await page.reload();
      await expect(page.getByTestId('chat-toggle')).toHaveAttribute('aria-expanded', 'false');
    }
    await page.getByTestId('chat-toggle').click();
    await expect(page.getByTestId('chat-toggle')).toHaveAttribute('aria-expanded', 'true');
  });

  test('clicking the collapsed rail expands chat', async ({ page }) => {
    await open(page, SEEDED);
    await page.getByTestId('chat-toggle').click();
    await page.getByTestId('chat').click({ position: { x: 20, y: 300 } });
    await expect(page.getByTestId('chat-toggle')).toHaveAttribute('aria-expanded', 'true');
  });

  test('empty state is full width with no toggle', async ({ page }) => {
    await open(page, EMPTY);
    await expect(page.getByTestId('studio-empty')).toBeVisible();
    await expect(page.getByTestId('chat-toggle')).toBeHidden();
    await expect(page.getByTestId('preview')).toBeHidden();
  });

  test('design guards', async ({ page }) => {
    await open(page, SEEDED);
    await expect(page.getByTestId('studio')).toBeVisible();
    await expectNoStrayAccent(page, '[data-testid="studio"]');
  });
});

test.describe('PR-03 · phone', () => {
  test.use(PHONE);
  test('one column, Preview button, no edge toggle, no overflow', async ({ page }) => {
    await open(page, SEEDED);
    await expect(page.getByTestId('preview-open')).toBeVisible();
    await expect(page.getByTestId('chat-toggle')).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });
});
