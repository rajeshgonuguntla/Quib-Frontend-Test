import type { MasterExamType } from './masterSubmit';

const EXAM_WORD = /\b(gre|sat)\b/i;
const EXAM_INTENT =
  /\b(test|exam|quiz|quizzes|practice|sample|section|verbal|quant|quantitative|analogy|analogies|generate|create|make|build|start)\b/i;

/** GRE or SAT named in the text. When both appear, the earlier one wins. */
export function namedStandardizedExam(text: string): 'gre' | 'sat' | null {
  const lower = text.toLowerCase();
  const greAt = lower.search(/\bgre\b/);
  const satAt = lower.search(/\bsat\b/);
  if (greAt === -1 && satAt === -1) return null;
  if (greAt === -1) return 'sat';
  if (satAt === -1) return 'gre';
  return greAt < satAt ? 'gre' : 'sat';
}

/**
 * True when the learner is asking for a GRE or SAT practice test,
 * not a general question that merely mentions the exam.
 */
export function isStandardizedExamRequest(text: string): boolean {
  const trimmed = text.trim();
  if (!EXAM_WORD.test(trimmed) || !EXAM_INTENT.test(trimmed)) return false;
  return namedStandardizedExam(trimmed) != null;
}

/** A named exam in the text overrides the Custom chip. An explicit GRE/SAT chip stays unless the text names the other exam. */
export function resolveExamType(text: string, selected: MasterExamType): MasterExamType {
  return namedStandardizedExam(text) ?? selected;
}

/** Prompt body sent to generation so a GRE/SAT request is not treated as a generic quiz topic. */
export function promptForExamGeneration(prompt: string, examType: string): string {
  const request = prompt.trim();
  if (examType === 'gre') {
    return [
      'Generate a GRE General Test practice set in official GRE style.',
      'Use text completion, sentence equivalence, reading comprehension, quantitative comparison, and problem solving.',
      'Do not generate a generic study quiz.',
      `Learner request: ${request}`,
    ].join(' ');
  }
  if (examType === 'sat') {
    return [
      'Generate an SAT practice set in official Digital SAT style.',
      'Use Reading and Writing plus Math items, including command of evidence, words in context, algebra, and problem solving.',
      'Do not generate a generic study quiz.',
      `Learner request: ${request}`,
    ].join(' ');
  }
  return request;
}

export function examDisplayTitle(apiTitle: string | undefined, examType: string): string {
  const title = apiTitle?.trim() ?? '';
  if (examType === 'gre' && !/\bgre\b/i.test(title)) return 'GRE practice test';
  if (examType === 'sat' && !/\bsat\b/i.test(title)) return 'SAT practice test';
  return title || 'Practice quiz';
}
