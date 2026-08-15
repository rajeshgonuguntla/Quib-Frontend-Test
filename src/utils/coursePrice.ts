import type { CatalogCourseSummary } from '../types/catalog';

export function coursePriceLabel(
  _course: Pick<CatalogCourseSummary, 'isFree' | 'priceCents' | 'currency'>,
): string {
  return 'Free';
}
