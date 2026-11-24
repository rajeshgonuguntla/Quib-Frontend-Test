import type { Page } from '@playwright/test';
import { test, expect, open, isRef, mockSession } from '../helpers/fixtures';

const S = {
  courses: { pr: 'PR-01', state: 'Educator · flag on', app: '/educator-courses' },
  studio: { pr: 'PR-01', state: 'Educator · Cubit Studio active', app: '/educator-studio' },
  analyticsRedirect: { pr: 'PR-01', state: 'Redirect /educator-analytics', app: '/educator-analytics' },
  learner: { pr: 'PR-01', state: 'Learner (flag on)', app: '/educator-courses' },
};
const navIds = (page: Page) => page.getByTestId('nav-item').evaluateAll((els) => els.map((e) => e.getAttribute('data-nav-id')));
const LEARNER_NAV = ['home', 'my-courses', 'practice', 'notes', 'review', 'progress', 'settings'];
const CREATOR_NAV = ['studio', 'published-courses', 'my-courses-educator', 'settings'];
const LEARNER_HOME = { pr: 'PR-01', state: 'Learner home', app: '/dashboard' };

test.describe('PR-01 · flag, admin nav and routes', () => {
  test('admin sees the creator-only rail: Cubit Studio, My courses, Settings', async ({ page }) => {
    if (!isRef) await mockSession(page, 'admin');
    await open(page, S.courses);
    await expect(page.getByTestId('nav-item').first()).toHaveText('Cubit Studio');
    if (isRef) {
      expect(await navIds(page)).toEqual(['studio', 'my-courses-educator', 'settings']);
    } else {
      await expect(page.getByTestId('nav-item').nth(1)).toHaveText('Published courses');
      expect(await navIds(page)).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
    }
    await expect(page.getByTestId('nav-item').filter({ hasText: 'Analytics' })).toHaveCount(0);
    await expect(page.getByTestId('nav-item').locator('.badge, [data-testid="nav-badge"]')).toHaveCount(0);
  });

  test('My courses is the active item on /educator-courses', async ({ page }) => {
    await open(page, S.courses);
    await expect(page.locator('[data-testid="nav-item"][aria-current="page"]')).toHaveAttribute('data-nav-id', 'my-courses-educator');
  });

  test('Cubit Studio is active on /educator-studio', async ({ page }) => {
    await open(page, S.studio);
    if (isRef) {
      await expect(page.locator('[data-testid="nav-item"][aria-current="page"]')).toHaveAttribute('data-nav-id', 'studio');
      return;
    }
    // The app studio is full-bleed: its own frame, no shell sidebar.
    await expect(page.getByTestId('studio')).toBeVisible();
    await expect(page.getByTestId('studio-empty')).toBeVisible();
    await expect(page.getByTestId('app-sidebar')).toHaveCount(0);
  });

  test('/educator-analytics redirects to /educator-courses', async ({ page }) => {
    await open(page, S.analyticsRedirect);
    if (isRef) await expect(page.getByTestId('ref-location')).toHaveText('/educator-courses');
    else await expect(page).toHaveURL(/\/educator-courses$/);
  });

  test('learners never reach educator routes', async ({ page }) => {
    if (!isRef) await mockSession(page, 'learner');
    await open(page, S.learner);
    if (isRef) {
      await expect(page.getByTestId('ref-location')).toHaveText('/dashboard');
      return;
    }
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
  });

  test('educators see the same rail as admins', async ({ page }) => {
    test.skip(isRef, 'reference kit still shows the educator rail');
    await mockSession(page, 'educator');
    await open(page, S.courses);
    await expect(page.getByTestId('nav-item').first()).toHaveText('Cubit Studio');
    await expect(page.getByTestId('nav-item').nth(1)).toHaveText('Published courses');
    expect(await navIds(page)).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByRole('heading', { name: 'My courses' })).toBeVisible();
  });

  test('clicking nav items navigates', async ({ page }) => {
    await open(page, S.courses);
    await page.locator('[data-testid="nav-item"][data-nav-id="studio"]').click();
    if (isRef) await expect(page.getByTestId('ref-location')).toHaveText('/educator-studio');
    else {
      await expect(page).toHaveURL(/\/educator-studio$/);
      await expect(page.getByTestId('studio')).toBeVisible();
      await expect(page.getByTestId('studio-empty')).toBeVisible();
      await expect(page.getByTestId('app-sidebar')).toHaveCount(0);
    }
  });
});

test.describe('profile based nav', () => {
  test.skip(isRef, 'reference kit does not call the app API');

  test('a learner profile shows Home through Progress', async ({ page }) => {
    await mockSession(page, 'learner');
    await open(page, LEARNER_HOME);
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
    await expect(page.getByTestId('nav-item').filter({ hasText: 'Cubit Studio' })).toHaveCount(0);
    await expect(page.getByTestId('nav-item').filter({ hasText: 'Published courses' })).toHaveCount(0);
  });

  test('an educator profile shows the creator rail', async ({ page }) => {
    await mockSession(page, 'educator');
    await open(page, S.courses);
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
    for (const label of ['Home', 'Practice', 'Notes', 'Review', 'Progress']) {
      await expect(page.getByTestId('nav-item').filter({ hasText: label })).toHaveCount(0);
    }
  });

  test('an admin profile shows the creator rail', async ({ page }) => {
    await mockSession(page, 'admin');
    await open(page, S.courses);
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
    for (const label of ['Home', 'Practice', 'Notes', 'Review', 'Progress']) {
      await expect(page.getByTestId('nav-item').filter({ hasText: label })).toHaveCount(0);
    }
  });

  test('an educator opening Home sees the creator rail', async ({ page }) => {
    await mockSession(page, 'educator');
    await open(page, LEARNER_HOME);
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
  });

  test('a student sign-in still follows the educator role', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('quib_sign_in_intent', 'student'));
    await mockSession(page, 'educator');
    await open(page, LEARNER_HOME);
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
  });
});

test.describe('PR-01 · session and API integration', () => {
  test.skip(isRef, 'reference kit does not call the app API');

  test('admin rail follows GET /api/users/me, billing, and enrollment stats', async ({ page }) => {
    const me = page.waitForResponse((res) => new URL(res.url()).pathname === '/api/users/me');
    const billing = page.waitForResponse((res) => new URL(res.url()).pathname === '/api/billing/me');
    const stats = page.waitForResponse((res) => new URL(res.url()).pathname === '/api/users/me/enrollments/stats');
    await mockSession(page, 'admin');
    await open(page, S.courses);

    expect((await me).status()).toBe(200);
    await expect((await me).json()).resolves.toMatchObject({ id: 'e2e-user', role: 'admin' });
    expect((await billing).status()).toBe(200);
    expect((await stats).status()).toBe(200);
    expect(await navIds(page)).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
  });

  test('an educator profile from /api/users/me sees the same rail as an admin', async ({ page }) => {
    const me = page.waitForResponse((res) => new URL(res.url()).pathname === '/api/users/me');
    await mockSession(page, 'educator');
    await open(page, S.courses);

    expect((await me).status()).toBe(200);
    await expect((await me).json()).resolves.toMatchObject({ role: 'educator' });
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByTestId('nav-item').first()).toHaveText('Cubit Studio');
    expect(await navIds(page)).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
    await expect(page.getByRole('heading', { name: 'My courses' })).toBeVisible();
  });

  test('a signed-out visit does not open Cubit Studio', async ({ page }) => {
    await page.route('**/api/auth/logout', (route) => route.fulfill({ status: 204, body: '' }));
    await page.addInitScript(() => localStorage.removeItem('cuib_session_exp'));
    await page.goto('/educator-studio');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId('studio')).toHaveCount(0);
    await expect(page.getByTestId('nav-item')).toHaveCount(0);
  });

  test('an admin course thread stays in the studio frame', async ({ page }) => {
    const me = page.waitForResponse((res) => new URL(res.url()).pathname === '/api/users/me');
    await mockSession(page, 'admin');
    await page.goto('/educator-studio/sat-math-sprint');
    expect((await me).status()).toBe(200);
    await expect((await me).json()).resolves.toMatchObject({ role: 'admin' });
    await expect(page.getByTestId('studio-course-title')).toHaveText('SAT Math Sprint');
    await expect(page.getByTestId('preview')).toBeVisible();
    await expect(page.getByTestId('app-sidebar')).toHaveCount(0);
  });
});
