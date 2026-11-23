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
    expect(body.message).toContain('lesson 1 in module 1 (lesson id l1)');
    expect(body.message).toContain('Shorten the notes');
    await route.fulfill({
      json: {
        reply: 'Shortened the notes.',
        hasCourseChanges: true,
        courseUpdate: {
          title: 'Algebra sprint',
          description: 'Slope and intercepts',
          difficulty: 'Intermediate',
          modules: [{
            ...course.modules[0],
            lessons: [{ ...course.modules[0].lessons[0], title: 'Slope, shortened' }],
          }],
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

test('a failed generate leaves the source card and shows the server message', async ({ page }) => {
  await mockSession(page);
  await page.route('**/api/course/generate', (route) => route.fulfill({
    status: 500,
    json: { message: 'Playlist not found' },
  }));
  await open(page, { pr: 'PR-04', state: 'New course', app: '/educator-studio' });
  await page.getByTestId('composer-input').fill(playlistUrl);
  await page.getByTestId('composer-send').click();
  await page.getByTestId('source-generate').click();
  await expect(page.getByText('Playlist not found')).toBeVisible();
  await expect(page.getByTestId('source-card')).toBeVisible();
  await expect(page).toHaveURL(/\/educator-studio$/);
});

test('a missing course shows the load error and no outline', async ({ page }) => {
  await mockSession(page);
  await page.route(`**/api/course/${courseId}`, (route) => route.fulfill({
    status: 404,
    json: { message: 'Course not found' },
  }));
  await open(page, { pr: 'PR-04', state: 'Missing course', app: `/educator-studio/${courseId}` });
  await expect(page.getByText('Course not found')).toBeVisible();
  await expect(page.getByTestId('outline')).toHaveCount(0);
});

test('reject dismisses an edit without saving, and a failed accept stays pending', async ({ page }) => {
  let puts = 0;
  await mockSession(page);
  await page.route(`**/api/course/${courseId}`, (route) => route.fulfill({ json: course }));
  await page.route(`**/api/courses/${courseId}`, (route) => {
    puts += 1;
    return route.fulfill({ status: 500, json: { message: 'Could not save' } });
  });
  await page.route(`**/api/educator/courses/${courseId}/assistant`, (route) => route.fulfill({
    json: {
      reply: 'Here is an edit.',
      hasCourseChanges: true,
      courseUpdate: {
        title: 'Algebra sprint',
        description: 'Slope and intercepts',
        difficulty: 'Intermediate',
        modules: [{
          ...course.modules[0],
          lessons: [{ ...course.modules[0].lessons[0], title: 'Slope, edited' }],
        }],
      },
      sessionId: 'sess-1',
    },
  }));
  await open(page, { pr: 'PR-04', state: 'Course', app: `/educator-studio/${courseId}` });
  await expect(page.getByTestId('outline-item')).toBeVisible();
  await page.getByTestId('composer-input').fill('Shorten the notes');
  await page.getByTestId('composer-send').click();
  await expect(page.getByText('Here is an edit.')).toBeVisible();
  await page.getByRole('button', { name: 'Reject' }).click();
  await expect(page.getByText('Rejected')).toBeVisible();
  expect(puts).toBe(0);

  await page.getByTestId('composer-input').fill('Try again');
  await page.getByTestId('composer-send').click();
  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByText('Could not save')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
});

test('the second message keeps the assistant session', async ({ page }) => {
  const bodies: Array<{ sessionId?: string; courseRevision?: string }> = [];
  await mockSession(page);
  await page.route(`**/api/course/${courseId}`, (route) => route.fulfill({ json: course }));
  await page.route(`**/api/educator/courses/${courseId}/assistant`, async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        reply: `Reply ${bodies.length}`,
        hasCourseChanges: false,
        sessionId: 'sess-1',
        courseRevision: 'rev-1',
      },
    });
  });
  await open(page, { pr: 'PR-04', state: 'Course', app: `/educator-studio/${courseId}` });
  await page.getByTestId('composer-input').fill('First');
  await page.getByTestId('composer-send').click();
  await expect(page.getByText('Reply 1')).toBeVisible();
  await page.getByTestId('composer-input').fill('Second');
  await page.getByTestId('composer-send').click();
  await expect(page.getByText('Reply 2')).toBeVisible();
  expect(bodies[1]?.sessionId).toBe('sess-1');
  expect(bodies[1]?.courseRevision).toBe('rev-1');
});

test('a single video is sent as that video URL', async ({ page }) => {
  let posted: { youtubeUrl?: string } | null = null;
  const videoUrl = 'https://www.youtube.com/watch?v=abcdefghijk';
  await mockSession(page);
  await page.route('**/api/course/generate', async (route) => {
    posted = route.request().postDataJSON();
    await route.fulfill({ json: course });
  });
  await page.route(`**/api/course/${courseId}`, (route) => route.fulfill({ json: course }));
  await open(page, { pr: 'PR-04', state: 'New course', app: '/educator-studio' });
  await page.getByTestId('composer-input').fill(videoUrl);
  await page.getByTestId('composer-send').click();
  await expect(page.getByTestId('source-detected')).toHaveText(/YouTube video/);
  await page.getByTestId('source-generate').click();
  await expect(page).toHaveURL(new RegExp(courseId));
  expect(posted?.youtubeUrl).toBe(videoUrl);
});

test('the SAT sample does not call the assistant', async ({ page }) => {
  let assistantHits = 0;
  await mockSession(page);
  await page.route('**/api/educator/courses/**/assistant', (route) => {
    assistantHits += 1;
    return route.fulfill({ json: { reply: 'The assistant should not run for this sample.', hasCourseChanges: false } });
  });
  await open(page, { pr: 'PR-03', state: 'Two panes (chat expanded)', app: '/educator-studio/sat-math-sprint' });
  await page.getByTestId('composer-input').fill('Hello');
  await page.getByTestId('composer-send').click();
  await expect(page.getByText(/This preview is static/)).toBeVisible();
  expect(assistantHits).toBe(0);
});
