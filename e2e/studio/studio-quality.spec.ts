import { test, expect, mockSession, open } from '../helpers/fixtures';
import { expectAccessible } from '../helpers/a11y';
import {
  expectNoEmojiGradientGlow,
  expectNoHorizontalOverflow,
  expectNoRowTints,
  expectNoRunningAnimations,
  expectNoStrayAccent,
} from '../helpers/designGuards';

const EMPTY = { pr: 'PR-03', state: 'Empty state (no toggle)', app: '/educator-studio' };
const SEEDED = { pr: 'PR-03', state: 'Two panes (chat expanded)', app: '/educator-studio/sat-math-sprint' };
const playlistUrl = 'https://www.youtube.com/playlist?list=PLreal-algebra';

test('studio screens meet the accessibility rules', async ({ page }) => {
  await mockSession(page);
  await open(page, EMPTY);
  await expect(page.getByTestId('studio-empty')).toBeVisible();
  await expectAccessible(page);
  await open(page, SEEDED);
  await expect(page.getByTestId('studio-course-title')).toHaveText('SAT Math Sprint');
  await expectAccessible(page);
  await expectNoStrayAccent(page, '[data-testid="studio"]');
  await expectNoEmojiGradientGlow(page, '[data-testid="studio"]');
  await expectNoRowTints(page);
});

test('the keyboard sends a message in the SAT sample', async ({ page }) => {
  await mockSession(page);
  await open(page, SEEDED);
  await page.getByTestId('composer-input').focus();
  await page.keyboard.type('Hello from the keyboard');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Hello from the keyboard')).toBeVisible();
  await expect(page.getByText(/This preview is static/)).toBeVisible();
});

test('reduced motion keeps the generate hairline still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockSession(page);
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/course/generate', async (route) => {
    await held;
    await route.fulfill({
      json: {
        courseId: '11111111-1111-1111-1111-111111111111',
        title: 'Held',
        modules: [],
      },
    });
  });
  await page.route('**/api/course/11111111-1111-1111-1111-111111111111', (route) => route.fulfill({
    json: { title: 'Held', modules: [] },
  }));
  await open(page, EMPTY);
  await page.getByTestId('composer-input').fill(playlistUrl);
  await page.getByTestId('composer-send').click();
  await page.getByTestId('source-generate').click();
  await expect(page.getByTestId('studio-status')).toBeVisible();
  await expectNoRunningAnimations(page, '[data-testid="studio"]');
  release();
});

test('a phone source card does not overflow and keeps a 16px title field', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSession(page);
  await open(page, EMPTY);
  await page.getByTestId('composer-input').fill(playlistUrl);
  await page.getByTestId('composer-send').click();
  await expect(page.getByTestId('source-title')).toHaveCSS('font-size', '16px');
  await expectNoHorizontalOverflow(page);
  await expectAccessible(page);
});

test('chromium keeps screenshot baselines for the empty studio, the source card, and the SAT sample', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Screenshot baselines are captured in Chromium.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockSession(page);
  await open(page, EMPTY);
  await expect(page.getByTestId('studio')).toHaveScreenshot('studio-empty.png', { animations: 'disabled' });
  await page.getByTestId('composer-input').fill(playlistUrl);
  await page.getByTestId('composer-send').click();
  await expect(page.getByTestId('source-card')).toBeVisible();
  await expect(page.getByTestId('studio')).toHaveScreenshot('studio-source.png', { animations: 'disabled' });
  await open(page, SEEDED);
  await expect(page.getByTestId('studio-course-title')).toHaveText('SAT Math Sprint');
  await expect(page.getByTestId('studio')).toHaveScreenshot('studio-sat.png', { animations: 'disabled' });
});
