import axios, { type AxiosError } from 'axios';

export type QuizSummaryRow = {
  id?: string;
  examType?: string;
  sourceType?: string;
  createdAt?: string;
  questionCount?: number;
};

/** Pure match: newest prompt quiz created at/after generate start (with clock skew). */
export function pickRecoveredQuizId(
  rows: QuizSummaryRow[],
  startedAtMs: number,
  examType?: string,
): string | null {
  const skewMs = 60_000;
  const wanted = examType?.trim().toLowerCase();
  const hits = rows
    .filter((q) => {
      if (!q?.id || !q.createdAt) return false;
      const created = Date.parse(q.createdAt);
      if (!Number.isFinite(created) || created < startedAtMs - skewMs) return false;
      if ((q.questionCount ?? 0) <= 0) return false;
      if (q.sourceType && q.sourceType.trim().toLowerCase() !== 'prompt') return false;
      if (wanted && q.examType && q.examType.trim().toLowerCase() !== wanted) return false;
      return true;
    })
    .sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!));
  return hits[0]?.id ?? null;
}

/** Client aborted / proxy died while Cloud Run may still finish generate-from-prompt. */
export function isRecoverableGenerateFailure(err: unknown): err is AxiosError {
  if (!axios.isAxiosError(err)) return false;
  if (!err.response) return true; // axios "Network Error"
  return [408, 502, 503, 504].includes(err.response.status);
}

/**
 * ponytail: mobile Chrome often aborts ~2–3min POSTs while Cloud Run still finishes
 * generate-from-prompt (prod: 200 @ ~170s + client "Network Error"). Poll library for the
 * saved quiz. Ceiling: 3min / 3s — upgrade: async job + status endpoint.
 */
export async function recoverGeneratedQuizId(opts: {
  startedAtMs: number;
  examType?: string;
  isCancelled?: () => boolean;
  pollMs?: number;
  giveUpMs?: number;
  initialDelayMs?: number;
}): Promise<string | null> {
  const pollMs = opts.pollMs ?? 3_000;
  const giveUpMs = opts.giveUpMs ?? 180_000;
  const initialDelayMs = opts.initialDelayMs ?? 0;
  if (initialDelayMs > 0) {
    await new Promise((r) => setTimeout(r, initialDelayMs));
  }
  const deadline = Date.now() + giveUpMs;

  while (Date.now() < deadline) {
    if (opts.isCancelled?.()) return null;
    try {
      const { data } = await axios.get<QuizSummaryRow[]>('/api/quizzes', { timeout: 12_000 });
      const id = pickRecoveredQuizId(Array.isArray(data) ? data : [], opts.startedAtMs, opts.examType);
      if (id) return id;
    } catch {
      /* keep polling */
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  return null;
}
