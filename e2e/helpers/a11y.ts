import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Serious and critical axe violations inside the studio. Color contrast is covered by the shell tokens. */
export async function expectAccessible(page: Page, selector = '[data-testid="studio"]') {
  const results = await new AxeBuilder({ page })
    .include(selector)
    .disableRules(['color-contrast'])
    .analyze();
  const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(serious.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    targets: violation.nodes.map((node) => node.target),
  }))).toEqual([]);
}
