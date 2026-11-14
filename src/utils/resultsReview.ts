export type ResultStatus = 'correct' | 'wrong' | 'skipped';

export function isSkippedAnswer(userAnswer: string | undefined): boolean {
  const raw = String(userAnswer ?? '').trim();
  return !raw || /^not answered$/i.test(raw);
}

export function classifyAttemptAnswer(
  userAnswer: string | undefined,
  isCorrect: boolean,
): ResultStatus {
  if (isCorrect) return 'correct';
  if (isSkippedAnswer(userAnswer)) return 'skipped';
  return 'wrong';
}

function sentenceCase(value: string): string {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** "Verbal Reasoning — Section 1" → "Verbal reasoning, section 1" */
export function formatResultsSectionLabel(title: string, fallback = 'Section'): string {
  const raw = title.trim() || fallback;
  const withComma = raw.replace(/\s*[—–-]\s*/g, ', ');
  return sentenceCase(withComma.replace(/\bSection\b/gi, 'section'));
}

/** Sidebar/question kicker: "Verbal reasoning · section 1" */
export function formatQuestionSectionKicker(title: string, fallback = ''): string {
  const label = formatResultsSectionLabel(title, fallback);
  if (!label) return '';
  return label.replace(', ', ' · ');
}

export function kickerForQuestionIndex(
  index0: number,
  questions: Array<{ sectionTitle?: string }>,
  sections: Array<{ title?: string; totalCount?: number }>,
): string | undefined {
  const fromQuestion = questions[index0]?.sectionTitle?.trim();
  if (fromQuestion) return formatQuestionSectionKicker(fromQuestion);
  let cursor = 0;
  for (const section of sections) {
    const n = section.totalCount ?? 0;
    if (n <= 0) continue;
    if (index0 >= cursor && index0 < cursor + n) {
      return section.title ? formatQuestionSectionKicker(section.title) : undefined;
    }
    cursor += n;
  }
  return undefined;
}

export function formatExamMetaLine(
  practiceLabel: string | undefined,
  submittedAt: string | undefined,
): string {
  const exam =
    practiceLabel && practiceLabel.toLowerCase() !== 'practice'
      ? `${practiceLabel} exam`
      : 'Practice exam';
  if (!submittedAt) return exam;
  const when = Date.parse(submittedAt);
  if (!Number.isFinite(when)) return exam;
  const formatted = new Date(when).toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${exam} · ${formatted}`;
}

export function resultsSummaryCopy(correct: number, total: number, passed: boolean): string {
  if (passed) {
    return `You scored ${correct} of ${total}. Review the questions below.`;
  }
  return `You scored ${correct} of ${total}. Review the questions below, then try again when you're ready.`;
}
