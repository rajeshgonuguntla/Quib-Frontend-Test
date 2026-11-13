export type LearnerStartMode = 'course' | 'notes' | 'flashcards' | 'blanks' | 'quiz';
export type SampleExamType = 'custom' | 'sat' | 'gre';

/** Maps dashboard tool tabs onto lesson study-tool APIs. Quiz is a separate generate path. */
export function studyToolFromStartMode(mode: string | undefined): 'notes' | 'flashcards' | 'blanks' | null {
  if (mode === 'notes' || mode === 'flashcards' || mode === 'blanks') return mode;
  return null;
}

/**
 * Notes / flashcards stay visible in the rail but are inert until their backend ships.
 * Course and quiz remain the only actionable start modes.
 */
export function isLearnerStartModeReady(mode: LearnerStartMode): boolean {
  return mode === 'course' || mode === 'quiz';
}

/** Visible start options in the student search bar (dashboard + landing). */
export const LEARNER_START_TABS: { id: LearnerStartMode; label: string }[] = [
  { id: 'course', label: 'Create a course' },
  { id: 'notes', label: 'Notes' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' },
];
