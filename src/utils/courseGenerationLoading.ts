/** Rotating messages shown during course generation (Phase 2 spec). */
export const COURSE_GENERATION_MESSAGES = [
  'Teaching the AI to teach...',
  'Generating questions about generating questions...',
  'The AI is pretending to study...',
  'Convincing the model this matters...',
  'The AI just asked to see the rubric...',
  'Running it through the AI... which runs on AI...',
  'Waiting for the AI to finish its own homework...',
  'The model is reading the syllabus for the first time...',
  "AI said 'one sec' twelve seconds ago...",
  'Technically the AI is the student right now...',
  'The AI is googling how to explain this...',
  'Someone should probably supervise this AI...',
  'The AI is taking notes. On itself.',
  'Checking if the AI actually read the material...',
  'The AI is questioning its own qualifications...',
  'AI confidence: high. Accuracy: being verified...',
  'The model is having an existential moment...',
  'Briefly forgot what a course was. Back now.',
  'The AI peer-reviewed itself and passed, barely...',
  'Currently outsmarting itself...',
  'The AI is re-reading its own output suspiciously...',
  'Debating whether this counts as learning...',
  'The AI just flagged its own answer as incorrect...',
  'Somewhere, a neural net is very stressed...',
  'The AI is pretending it planned this all along...',
] as const;

/** Expected generation window from the product spec (2–5 minutes). */
export const COURSE_GEN_ESTIMATE_MIN_SEC = 120;
export const COURSE_GEN_ESTIMATE_MAX_SEC = 300;

/** Time-based progress capped below 100% until the API responds. */
export function estimateCourseGenerationProgress(elapsedSec: number): number {
  const targetSec = COURSE_GEN_ESTIMATE_MIN_SEC + (COURSE_GEN_ESTIMATE_MAX_SEC - COURSE_GEN_ESTIMATE_MIN_SEC) * 0.6;
  const raw = (elapsedSec / targetSec) * 95;
  return Math.min(95, Math.max(0, Math.round(raw)));
}

export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
