import { test, expect, open, isRef } from '../helpers/fixtures';
import { findStrayAccent } from '../helpers/designGuards';

/* PR-02 ships the helpers themselves. This spec proves the guard catches a violation and passes clean UI.
   In APP mode it runs the guard on /educator-courses (after PR-04) — until then it is skipped. */
test.describe('PR-02 · design guard', () => {
  test('passes on the approved UI', async ({ page }) => {
    test.skip(!isRef, 'APP coverage comes from each PR spec calling expectNoStrayAccent');
    await open(page, { pr: 'PR-02', state: 'Pass', app: '/' });
    expect(await findStrayAccent(page, '#gSample')).toEqual([]);
    await expect(page.getByTestId('guard-result')).toHaveAttribute('data-result', 'pass');
  });

  test('fails on an orange row tint and orange meta text', async ({ page }) => {
    test.skip(!isRef, 'reference-only demo of the guard');
    await open(page, { pr: 'PR-02', state: 'Fail (violation injected)', app: '/' });
    const v = await findStrayAccent(page, '#gSample');
    expect(v.map((x) => x.kind).sort()).toEqual(['background', 'text']);
    await expect(page.getByTestId('guard-result')).toHaveAttribute('data-result', 'fail');
  });
});
