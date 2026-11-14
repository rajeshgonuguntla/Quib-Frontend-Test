import type { SampleExamType } from './learnerStartMode';

/** Chip / API value. Explicit SAT or GRE always wins; Custom infers from the prompt. */
export function resolveExamType(
  selected: string | undefined,
  text: string | undefined,
): SampleExamType {
  const s = (selected || 'custom').trim().toLowerCase();
  if (s === 'sat' || s === 'gre') return s;
  return inferExamTypeFromText(text);
}

/** "GRE verbal: text completion" → gre even if the Custom chip is selected. */
export function inferExamTypeFromText(text: string | undefined): SampleExamType {
  const t = (text ?? '').trim().toLowerCase();
  if (!t) return 'custom';
  if (/\bgre\b/.test(t) || t.includes('graduate record')) return 'gre';
  if (/\bsat\b/.test(t) || t.includes('scholastic aptitude')) return 'sat';
  return 'custom';
}
