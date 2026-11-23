/**
 * e2e/helpers/designGuards.ts — copy into the repo in PR-02.
 * Executable versions of the design rules in .cursor/skills/design-guardrails/CUIB.md + the approved mockup.
 */
import { expect, type Page } from '@playwright/test';

/**
 * Where orange (--accent / --accent-soft) is allowed. Everything else fails.
 * In the APP, mark an element that legitimately uses orange with data-accent="<reason>":
 *   symbol (diff +/−, change marker, Fix with AI icon) · primary (primary button, send) · chip (@-mention chips)
 *   progress (hairline, completion meter, checkbox tick, switch on) · status (Published badge, active tab count)
 *   link (Select all) · nav (active nav bar) · analytics (weakest-topic %, tutor timestamps: approved in My courses)
 * In the REFERENCE, the same elements are matched by their mockup class names (second half of the list).
 */
export const ACCENT_ALLOW = [
  '[data-accent]', 'svg', '[data-ref-only]',
  '.sg', '.ln-sg', '.btn-primary', '.st-send', '.ai-fix', '.pv-fix', '.st-switch.on', '.hairline', '.meter',
  '.pick .box', '.nav-item .bar', '.st-ref', '.badge-live', '.status-tab-count', '.btn-link', '.pv-blank',
  '.bars .weak .p', '.asked .r .mono',
].join(', ');

export interface AccentViolation { kind: 'text' | 'background' | 'border'; el: string; text: string }

export async function findStrayAccent(page: Page, rootSelector = 'body'): Promise<AccentViolation[]> {
  return page.evaluate(({ rootSelector, allow }) => {
    const root = document.querySelector(rootSelector) ?? document.body;
    const probe = document.createElement('span');
    // tokens live on .cuib-app (src/styles/app-shell.css), so probe inside it
    (root.closest('.cuib-app') ?? root.querySelector('.cuib-app') ?? root).appendChild(probe);
    const accents: string[] = [];
    for (const v of ['--accent', '--accent-soft']) {
      probe.style.color = `var(${v})`;
      accents.push(getComputedStyle(probe).color);
    }
    probe.remove();
    const out: { kind: 'text' | 'background' | 'border'; el: string; text: string }[] = [];
    root.querySelectorAll('*').forEach((el) => {
      if (el.closest(allow)) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const name = el.getAttribute('data-testid') || `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className || '').trim().split(/\s+/).join('.')}`;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim());
      const text = (el.textContent || '').trim().slice(0, 40);
      if (hasText && accents.includes(cs.color)) out.push({ kind: 'text', el: name, text });
      if (accents.includes(cs.backgroundColor)) out.push({ kind: 'background', el: name, text });
      for (const s of ['Top', 'Right', 'Bottom', 'Left'] as const) {
        if (parseFloat(cs.getPropertyValue(`border-${s.toLowerCase()}-width`)) > 0 && accents.includes(cs.getPropertyValue(`border-${s.toLowerCase()}-color`))) {
          out.push({ kind: 'border', el: name, text });
          break;
        }
      }
    });
    return out;
  }, { rootSelector, allow: ACCENT_ALLOW });
}

/** Orange only on symbols and primary controls. */
export async function expectNoStrayAccent(page: Page, rootSelector = 'body'): Promise<void> {
  expect(await findStrayAccent(page, rootSelector)).toEqual([]);
}

/** Every visible match is at least `min` px in both directions (phone: 44). */
export async function expectTouchTargets(page: Page, selector: string, min = 44): Promise<void> {
  const small = await page.evaluate(({ selector, min }) =>
    [...document.querySelectorAll(selector)].filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && cs.visibility !== 'hidden' && (Math.round(r.width) < min || Math.round(r.height) < min);
    }).map((el) => `${el.getAttribute('data-testid') || el.className} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`),
  { selector, min });
  expect(small, `targets smaller than ${min}px`).toEqual([]);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'horizontal overflow (px)').toBeLessThanOrEqual(1);
}

/** No emoji in UI copy and no gradients / glows anywhere. */
export async function expectNoEmojiGradientGlow(page: Page, rootSelector = 'body'): Promise<void> {
  const bad = await page.evaluate((rootSelector) => {
    const root = document.querySelector(rootSelector) ?? document.body;
    const out: string[] = [];
    if (/\p{Extended_Pictographic}/u.test((root as HTMLElement).innerText)) out.push('emoji in text');
    root.querySelectorAll('*').forEach((el) => {
      if (el.closest('[data-ref-only]')) return;
      const cs = getComputedStyle(el);
      if (cs.backgroundImage.includes('gradient')) out.push(`gradient: ${el.getAttribute('data-testid') || (el as HTMLElement).className}`);
      if (cs.textShadow !== 'none') out.push(`text-shadow: ${el.getAttribute('data-testid') || (el as HTMLElement).className}`);
    });
    return [...new Set(out)];
  }, rootSelector);
  expect(bad).toEqual([]);
}

/** Selected / changed rows are never tinted orange; the selected row uses var(--fill). */
export async function expectNoRowTints(page: Page): Promise<void> {
  const tinted = await page.evaluate(() => {
    const probe = document.createElement('span');
    (document.querySelector('.cuib-app') ?? document.body).appendChild(probe);
    probe.style.color = 'var(--accent-soft)';
    const soft = getComputedStyle(probe).color;
    probe.style.color = 'var(--accent)';
    const acc = getComputedStyle(probe).color;
    probe.remove();
    return [...document.querySelectorAll('[data-testid="outline-row"], [data-testid="course-row"], [data-testid="diff-op"]')]
      .filter((el) => [soft, acc].includes(getComputedStyle(el).backgroundColor))
      .map((el) => el.getAttribute('data-item-id') || el.getAttribute('data-course-id') || 'row');
  });
  expect(tinted, 'rows tinted orange').toEqual([]);
}

/** With prefers-reduced-motion, nothing keeps animating after the UI settles. */
export async function expectNoRunningAnimations(page: Page, rootSelector = 'body'): Promise<void> {
  await page.waitForTimeout(100);
  const running = await page.evaluate((rootSelector) => {
    const root = document.querySelector(rootSelector) ?? document.body;
    return document.getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => (a.effect as KeyframeEffect | null)?.target as Element | null)
      .filter((t): t is Element => !!t && root.contains(t) && !t.closest('[data-ref-only]'))
      .map((t) => t.getAttribute('data-testid') || (t as HTMLElement).className);
  }, rootSelector);
  expect(running, 'animations still running under reduced motion').toEqual([]);
}

/** Exactly one percentage on screen inside `rootSelector` (generation progress rule). */
export async function expectSinglePercent(page: Page, rootSelector: string): Promise<void> {
  const n = await page.evaluate((sel) => ((document.querySelector(sel) as HTMLElement | null)?.innerText.match(/\d+\s*%/g) ?? []).length, rootSelector);
  expect(n).toBe(1);
}
