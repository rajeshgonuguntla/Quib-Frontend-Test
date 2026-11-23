import { test, expect, mockSession, open } from '../helpers/fixtures';
import { expectNoStrayAccent } from '../helpers/designGuards';

const courseId = '11111111-1111-1111-1111-111111111111';
const playlistUrl = 'https://www.youtube.com/playlist?list=PLreal-algebra';

const course = {
  courseId,
  publicSlug: 'algebra',
  title: 'Algebra sprint',
  isPublished: false,
  description: 'Slope and intercepts',
  modules: [{
    id: 'm1',
    title: 'Lines',
    description: '',
    lessons: [{
      id: 'l1',
      title: 'Slope in 12 minutes',
      duration: '12:00',
      type: 'video',
      summary: 'm is the slope.',
    }],
    quiz: [],
  }],
};

test('a pasted playlist generates from that URL and the outline comes back', async ({ page }) => {
  let posted: { youtubeUrl?: string; options?: { builderNotes?: string } } | null = null;
  let saved = false;
  await mockSession(page);
  await page.route('**/api/course/generate', async (route) => {
    posted = route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 400));
    await route.fulfill({ json: course });
  });
  await page.route(`**/api/course/${courseId}`, (route) => route.fulfill({
    json: saved
      ? { ...course, modules: [{ ...course.modules[0], lessons: [{ ...course.modules[0].lessons[0], title: 'Slope, shortened' }] }] }
      : course,
  }));
  await page.route(`**/api/courses/${courseId}`, async (route) => {
    saved = true;
    await route.fulfill({ json: {} });
  });
  await page.route(`**/api/educator/courses/${courseId}/assistant`, async (route) => {
    const body = route.request().postDataJSON() as { message?: string };
    expect(body.message).toContain('@Slope in 12 minutes');
    await route.fulfill({
      json: {
        reply: 'Shortened the notes.',
        hasCourseChanges: true,
        courseUpdate: {
          title: 'Algebra sprint',
          description: 'Slope and intercepts',
          difficulty: 'Intermediate',
          modules: course.modules,
        },
        sessionId: 'sess-1',
        courseRevision: 'rev-1',
      },
    });
  });

  await open(page, { pr: 'PR-04', state: 'New course', app: '/educator-studio' });
  await page.getByTestId('composer-input').fill(playlistUrl);
  await page.getByTestId('composer-send').click();
  await expect(page.getByTestId('source-detected')).toHaveText(/YouTube playlist/);
  await expect(page.getByTestId('source-card').getByText(playlistUrl)).toBeVisible();
  await expect(page.getByTestId('source-pick')).toHaveCount(0);
  await expectNoStrayAccent(page, '[data-testid="studio"]');
  await page.getByTestId('source-title').fill('Algebra sprint');
  await page.getByTestId('source-desc').fill('Slope and intercepts');
  await page.getByTestId('source-generate').click();
  await expect(page.getByTestId('studio-status')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(courseId));
  await expect(page.getByTestId('outline-item').filter({ hasText: 'Slope in 12 minutes' })).toBeVisible();
  expect(posted?.youtubeUrl).toBe(playlistUrl);
  expect(posted?.options?.builderNotes).toContain('Title: Algebra sprint');
  expect(JSON.stringify(posted)).not.toContain('PLsatmath');

  await page.getByTestId('row-add').click();
  await page.getByTestId('composer-input').fill('Shorten the notes');
  await page.getByTestId('composer-send').click();
  await expect(page.getByText('Shortened the notes.')).toBeVisible();
  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByText('Accepted')).toBeVisible();
  await expect(page.getByTestId('outline-item').filter({ hasText: 'Slope, shortened' })).toBeVisible();
});

test('generate stays a phone-sized target', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockSession(page);
  await open(page, { pr: 'PR-04', state: 'New course', app: '/educator-studio' });
  await page.getByTestId('composer-input').fill(playlistUrl);
  await page.getByTestId('composer-send').click();
  const box = await page.getByTestId('source-generate').boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await expect(page.getByTestId('preview')).toBeHidden();
});

test('web and PDF links stay in the chat', async ({ page }) => {
  await mockSession(page);
  await open(page, { pr: 'PR-04', state: 'New course', app: '/educator-studio' });
  await page.getByTestId('composer-input').fill('https://example.com/notes.pdf');
  await page.getByTestId('composer-send').click();
  await expect(page.getByText('Only a YouTube video or playlist can be turned into a course today.')).toBeVisible();
  await expect(page.getByTestId('source-generate')).toHaveCount(0);
});
