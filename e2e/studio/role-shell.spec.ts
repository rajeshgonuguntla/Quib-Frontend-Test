import type { Page } from '@playwright/test';
import { test, expect, open, isRef, mockSession } from '../helpers/fixtures';

const LEARNER_NAV = ['home', 'my-courses', 'practice', 'notes', 'review', 'progress'];
const CREATOR_NAV = ['studio', 'published-courses', 'my-courses-educator'];
const navIds = (page: Page) => page.getByTestId('nav-item').evaluateAll((els) => els.map((el) => el.getAttribute('data-nav-id')));

const screen = (app: string) => ({ pr: 'PR-01', state: 'Role shell', app });

test.describe('role shell', () => {
  test.skip(isRef, 'reference kit does not call the app API');

  test('a learner stays on the dashboard shell', async ({ page }) => {
    await mockSession(page, 'learner');
    await open(page, screen('/dashboard'));
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect(page.getByTestId('studio')).toHaveCount(0);
    await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
    for (const label of ['Cubit Studio', 'Published courses', 'Analytics']) {
      await expect(page.getByTestId('nav-item').filter({ hasText: label })).toHaveCount(0);
    }
  });

  test('a learner pasted into Cubit Studio is sent home', async ({ page }) => {
    await mockSession(page, 'learner');
    await open(page, screen('/educator-studio'));
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('studio')).toHaveCount(0);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
  });

  test('a learner pasted into educator courses is sent home', async ({ page }) => {
    await mockSession(page, 'learner');
    await open(page, screen('/educator-courses'));
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
  });

  test('a learner stays on the learner pages', async ({ page }) => {
    await mockSession(page, 'learner');
    await page.route('**/api/users/me/enrollments', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/notes**', (route) => route.fulfill({ json: [] }));
    await page.route('**/api/quizzes**', (route) => route.fulfill({ json: [] }));
    for (const path of ['/my-courses', '/practice', '/notes', '/review', '/library']) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByTestId('app-sidebar')).toBeVisible();
      await expect(page.getByTestId('studio')).toHaveCount(0);
      await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
    }
  });

  test('an educator opening Home sees the creator rail', async ({ page }) => {
    await mockSession(page, 'educator');
    await open(page, screen('/dashboard'));
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect(page.getByTestId('studio')).toHaveCount(0);
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
  });

  test('a student sign-in does not keep an educator on the learner rail', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('quib_sign_in_intent', 'student'));
    await mockSession(page, 'educator');
    await open(page, screen('/dashboard'));
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
  });

  test('an admin opening Home sees the creator rail', async ({ page }) => {
    await mockSession(page, 'admin');
    await open(page, screen('/dashboard'));
    await expect(page).toHaveURL(/\/educator-courses$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect(page.getByTestId('studio')).toHaveCount(0);
    await expect.poll(() => navIds(page)).toEqual(CREATOR_NAV);
  });

  test('a missing role stays on the learner dashboard', async ({ page }) => {
    await page.route('**/api/users/me', (route) =>
      route.fulfill({ json: { id: 'e2e-user', name: 'Priya Raman', email: 'priya@example.com' } }),
    );
    await open(page, screen('/dashboard'));
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId('app-sidebar')).toBeVisible();
    await expect(page.getByTestId('studio')).toHaveCount(0);
    await expect.poll(() => navIds(page)).toEqual(LEARNER_NAV);
  });
});
