import type { CatalogCourseSummary } from '../types/catalog';
import { formatPriceCents } from './formatPrice';

export function coursePriceLabel(
  course: Pick<CatalogCourseSummary, 'isFree' | 'priceCents' | 'currency'>,
): string {
  if (course.isFree !== false && (!course.priceCents || course.priceCents <= 0)) {
    return 'Free';
  }
  return formatPriceCents(course.priceCents, course.currency);
}
