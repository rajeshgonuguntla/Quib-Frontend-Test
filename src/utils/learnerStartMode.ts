export type LearnerStartMode = 'cubit' | 'course' | 'notes' | 'flashcards' | 'blanks' | 'quiz';
export type SampleExamType = 'custom' | 'sat' | 'gre';

/** Maps dashboard tool tabs onto lesson study-tool APIs. Quiz is a separate generate path. */
export function studyToolFromStartMode(mode: string | undefined): 'notes' | 'flashcards' | 'blanks' | null {
  if (mode === 'notes' || mode === 'flashcards' || mode === 'blanks') return mode;
  return null;
}

/**
 * Flashcards stay visible but inert until their backend ships.
 * Notes is frontend-ready (rich editor + local draft).
 */
export function isLearnerStartModeReady(mode: LearnerStartMode): boolean {
  return mode === 'cubit' || mode === 'course' || mode === 'notes' || mode === 'quiz';
}

/** Visible start options in the student search bar (dashboard + landing). */
export const LEARNER_START_TABS: { id: LearnerStartMode; label: string }[] = [
  { id: 'cubit', label: 'Cubit' },
  { id: 'course', label: 'Create a course' },
  { id: 'notes', label: 'Notes' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' },
];
