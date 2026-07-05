export function formatPriceCents(priceCents: number | null | undefined, currency = 'USD'): string {
  if (priceCents == null || priceCents <= 0) {
    return 'Free';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(priceCents / 100);
}
