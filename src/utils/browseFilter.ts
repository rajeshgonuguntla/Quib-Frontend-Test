export const BROWSE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'programming', label: 'Programming' },
  { id: 'ai-ml', label: 'AI / ML' },
  { id: 'data', label: 'Data' },
  { id: 'web', label: 'Web dev' },
] as const;

export type BrowseFilterId = (typeof BROWSE_FILTERS)[number]['id'];

export function browseCategoryKey(category: string): BrowseFilterId | 'other' {
  const t = category.toLowerCase();
  if (/\bweb(\s*dev)?\b/.test(t)) return 'web';
  if (/\b(ai|ml|machine learning|databricks)\b/.test(t)) return 'ai-ml';
  if (/\b(data|pandas)\b/.test(t)) return 'data';
  if (/(program|python|code)/.test(t)) return 'programming';
  return 'other';
}

export function courseThumbGlyph(tag: string, title = ''): string {
  const t = `${tag} ${title}`.toLowerCase();
  if (t.includes('rest') || t.includes('api') || /\bweb\b/.test(t)) return 'GET /';
  if (t.includes('pandas') || t.includes('csv') || t.includes('wrangling')) return '.csv';
  if (t.includes('function') || t.includes('control flow')) return 'def';
  if (t.includes('object-oriented') || t.includes('classes in')) return 'class';
  if (t.includes('data structure') || t.includes('algorithm')) return '[ ]';
  if (t.includes('machine learning') && t.includes('foundation')) return 'import';
  if (t.includes('program') || t.includes('python')) return '>>>';
  if (t.includes('quiz')) return '?';
  return '{ }';
}

export function matchesBrowseCard(opts: {
  filter: string;
  query: string;
  category: string;
  title: string;
  creator: string;
}): boolean {
  const key = browseCategoryKey(opts.category);
  if (opts.filter !== 'all' && key !== opts.filter) return false;
  const q = opts.query.trim().toLowerCase();
  if (!q) return true;
  return opts.title.toLowerCase().includes(q) || opts.creator.toLowerCase().includes(q);
}
