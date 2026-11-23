import type { Page } from '@playwright/test';
import { test, expect, open, isRef, mockSession } from '../helpers/fixtures';

const S = {
  courses: { pr: 'PR-01', state: 'Educator · flag on', app: '/educator-courses' },
  studio: { pr: 'PR-01', state: 'Educator · Cubit Studio active', app: '/educator-studio' },
  analyticsRedirect: { pr: 'PR-01', state: 'Redirect /educator-analytics', app: '/educator-analytics' },
  learner: { pr: 'PR-01', state: 'Learner (flag on)', app: '/educator-courses' },
};
const navIds = (page: Page) => page.getByTestId('nav-item').evaluateAll((els) => els.map((e) => e.getAttribute('data-nav-id')));

test.describe('PR-01 · flag, admin nav and routes', () => {
  test('admin sees the creator-only rail: Cubit Studio, My courses, Settings', async ({ page }) => {
    if (!isRef) await mockSession(page, 'admin');
    await open(page, S.courses);
    await expect(page.getByTestId('nav-item').first()).toHaveText('Cubit Studio');
    expect(await navIds(page)).toEqual(['studio', 'my-courses-educator', 'settings']);
    await expect(page.getByTestId('nav-item').filter({ hasText: 'Analytics' })).toHaveCount(0);
    await expect(page.getByTestId('nav-item').locator('.badge, [data-testid="nav-badge"]')).toHaveCount(0);
  });

  test('My courses is the active item on /educator-courses', async ({ page }) => {
    await open(page, S.courses);
    await expect(page.locator('[data-testid="nav-item"][aria-current="page"]')).toHaveAttribute('data-nav-id', 'my-courses-educator');
  });

  test('Cubit Studio is active on /educator-studio', async ({ page }) => {
    await open(page, S.studio);
    await expect(page.locator('[data-testid="nav-item"][aria-current="page"]')).toHaveAttribute('data-nav-id', 'studio');
  });

  test('/educator-analytics redirects to /educator-courses', async ({ page }) => {
    await open(page, S.analyticsRedirect);
    if (isRef) await expect(page.getByTestId('ref-location')).toHaveText('/educator-courses');
    else await expect(page).toHaveURL(/\/educator-courses$/);
  });

  test('learners never reach educator routes', async ({ page }) => {
    if (!isRef) await mockSession(page, 'learner');
    await open(page, S.learner);
    expect(await navIds(page)).not.toContain('studio');
    if (isRef) await expect(page.getByTestId('ref-location')).toHaveText('/dashboard');
    else await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('educators do not get the studio rail', async ({ page }) => {
    test.skip(isRef, 'reference kit still shows the educator rail');
    await mockSession(page, 'educator');
    await open(page, S.courses);
    expect(await navIds(page)).not.toContain('studio');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('clicking nav items navigates', async ({ page }) => {
    await open(page, S.courses);
    await page.locator('[data-testid="nav-item"][data-nav-id="studio"]').click();
    if (isRef) await expect(page.getByTestId('ref-location')).toHaveText('/educator-studio');
    else await expect(page).toHaveURL(/\/educator-studio$/);
  });
});
