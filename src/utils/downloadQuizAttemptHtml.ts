import { BRAND_ACCENT_LIGHT, BRAND_FEEDBACK_RED, BRAND_NAME } from '../brand';

/** Public app host for links inside downloaded HTML (not the dev origin). */
export const CUBIT_APP_ORIGIN = 'https://mycubit.app';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cubitPublicQuizUrl(quizId?: string | null): string {
  const id = quizId?.trim();
  if (id && UUID_RE.test(id)) {
    return `${CUBIT_APP_ORIGIN}/quiz/${id}`;
  }
  return CUBIT_APP_ORIGIN;
}

const CUBIT_EXPORT_FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
`;

function cubitExportCss(): string {
  return `
    :root {
      --bg: #ffffff;
      --surface: #ffffff;
      --ink: #0a0a0a;
      --ink-soft: #6e6e6e;
      --ink-faint: #a3a3a3;
      --border: #eaeaea;
      --fill: #f5f5f5;
      --accent: ${BRAND_ACCENT_LIGHT};
      --accent-soft: #fff1e6;
      --feedback-bad: ${BRAND_FEEDBACK_RED};
      --feedback-ok: #16a34a;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #050505;
        --surface: #0d0d0d;
        --ink: #f2f2f2;
        --ink-soft: #8a8a8a;
        --ink-faint: #5a5a5a;
        --border: #1c1c1c;
        --fill: #141414;
        --accent: #ff7a1a;
        --accent-soft: rgba(255, 122, 26, 0.14);
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      background: var(--bg);
      color: var(--ink);
      line-height: 1.5;
      padding: 24px 16px 48px;
    }
    .wrap { max-width: 720px; margin: 0 auto; }
    .hide { display: none !important; }
    .cubit-mark {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .cubit-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background: var(--accent);
      flex-shrink: 0;
    }
    .cubit-name {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--ink);
    }
    .kicker {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-faint);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
      margin: 0 0 8px;
    }
    .hairline {
      height: 1px;
      width: 100%;
      background: var(--border);
      margin: 20px 0;
    }
    .hairline-accent {
      height: 2px;
      width: 48px;
      background: var(--accent);
      margin: 0 0 20px;
      border-radius: 1px;
    }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 8px; letter-spacing: -0.02em; }
    .meta { color: var(--ink-soft); font-size: 0.875rem; margin: 0 0 16px; }
    .primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      background: var(--accent);
      color: #fff;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .primary.wide { width: 100%; margin-top: 8px; }
    .primary.ghost {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--ink);
    }
    .footer-link { margin-top: 24px; font-size: 0.875rem; }
    .footer-link a { color: var(--accent); text-decoration: none; }
    .footer-link a:hover { text-decoration: underline; }
    .sub { font-size: 0.75rem; color: var(--ink-faint); margin-top: 16px; line-height: 1.45; }
  `;
}

function cubitWordmarkHtml(): string {
  return `<div class="cubit-mark" aria-label="${escapeHtmlForExport(BRAND_NAME)}">
    <span class="cubit-dot" aria-hidden="true"></span>
    <span class="cubit-name">${escapeHtmlForExport(BRAND_NAME)}</span>
  </div>`;
}

export type QuizAttemptReviewRow = {
  index: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
};

export type QuizAttemptSectionScore = {
  topic: string;
  scorePercent: number;
  totalCount: number;
};

export type QuizAttemptHtmlPayload = {
  quizTitle: string;
  channelName?: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  attemptNumber?: number;
  submittedAt?: string;
  sectionScores: QuizAttemptSectionScore[];
  questions: QuizAttemptReviewRow[];
  /** Optional link for others to take the same quiz on Cubit. */
  takeQuizUrl?: string;
};

export function escapeHtmlForExport(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugFilename(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return base.length > 0 ? base : 'quiz-attempt';
}

export function buildQuizAttemptHtml(payload: QuizAttemptHtmlPayload): string {
  const title = escapeHtmlForExport(payload.quizTitle);
  const channel = payload.channelName?.trim()
    ? `<p class="meta">${escapeHtmlForExport(payload.channelName)}</p>`
    : '';
  const attemptMeta = [
    payload.attemptNumber != null ? `Attempt #${payload.attemptNumber}` : null,
    payload.submittedAt
      ? new Date(payload.submittedAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const sections =
    payload.sectionScores.length > 0
      ? `<section class="sections">
      <h2>Section scores</h2>
      <ul>
        ${payload.sectionScores
          .map(
            (s) =>
              `<li><span class="sec-name">${escapeHtmlForExport(s.topic)}</span> <span class="sec-score">${s.scorePercent}%</span> <span class="sec-meta">(${s.totalCount} questions)</span></li>`,
          )
          .join('\n')}
      </ul>
    </section>`
      : '';

  const questions = payload.questions
    .map((q) => {
      const status = q.isCorrect ? 'correct' : 'incorrect';
      const expl = q.explanation?.trim()
        ? `<div class="block"><div class="label">Explanation</div><div class="box expl">${escapeHtmlForExport(q.explanation)}</div></div>`
        : '';
      return `<details class="q ${status}" open>
        <summary>
          <span class="q-num">Q${q.index}</span>
          <span class="q-text">${escapeHtmlForExport(q.question)}</span>
          <span class="badge ${status}">${q.isCorrect ? 'Correct' : 'Incorrect'}</span>
        </summary>
        <div class="q-body">
          <div class="block">
            <div class="label">Your answer</div>
            <div class="box yours">${escapeHtmlForExport(q.userAnswer || '—')}</div>
          </div>
          <div class="block">
            <div class="label">Correct answer</div>
            <div class="box right">${escapeHtmlForExport(q.correctAnswer || '—')}</div>
          </div>
          ${expl}
        </div>
      </details>`;
    })
    .join('\n');

  const quizLink = payload.takeQuizUrl
    ? `<p class="footer-link"><a href="${escapeHtmlForExport(payload.takeQuizUrl)}">Take this quiz on ${escapeHtmlForExport(BRAND_NAME)}</a></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${escapeHtmlForExport(BRAND_NAME)} attempt</title>
  ${CUBIT_EXPORT_FONTS}
  <style>
    ${cubitExportCss()}
    .score-card {
      border: 1px solid var(--border);
      background: var(--fill);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 24px;
    }
    .score-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px 24px; }
    .score-pct { font-size: 2.5rem; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
    .score-detail { font-size: 0.875rem; color: var(--ink-soft); }
    .pass-pill {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1px solid var(--border);
    }
    .pass-pill.pass { color: var(--feedback-ok); background: var(--accent-soft); }
    .pass-pill.fail { color: var(--feedback-bad); background: var(--fill); }
    h2 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--ink-faint); font-family: \"IBM Plex Mono\", ui-monospace, monospace; margin: 0 0 12px; }
    .sections ul { list-style: none; padding: 0; margin: 0 0 28px; }
    .sections li {
      display: flex; flex-wrap: wrap; gap: 8px; align-items: baseline;
      padding: 10px 0; border-bottom: 1px solid var(--border);
      font-size: 0.875rem;
    }
    .sec-name { flex: 1; min-width: 140px; }
    .sec-score { font-weight: 600; color: var(--accent); }
    .sec-meta { color: var(--ink-faint); font-size: 0.8rem; }
    details.q {
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 10px;
      background: var(--fill);
    }
    details.q summary {
      cursor: pointer;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      align-items: flex-start;
      padding: 14px 16px;
      font-weight: 500;
      font-size: 0.9rem;
    }
    details.q summary::-webkit-details-marker { display: none; }
    .q-num { font-family: \"IBM Plex Mono\", ui-monospace, monospace; font-size: 0.75rem; color: var(--ink-faint); }
    .q-text { flex: 1; min-width: 200px; }
    .badge { font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
    .badge.correct { color: var(--feedback-ok); background: var(--accent-soft); }
    .badge.incorrect { color: var(--feedback-bad); background: var(--fill); }
    .q-body { padding: 0 16px 16px; border-top: 1px solid var(--border); }
    .block { margin-top: 12px; }
    .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); margin-bottom: 6px; font-family: \"IBM Plex Mono\", ui-monospace, monospace; }
    .box {
      display: block;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 0.875rem;
      border: 1px solid var(--border);
      background: var(--bg);
      white-space: pre-wrap;
    }
    .box.yours { border-color: var(--border); }
    .box.right { border-color: rgba(22, 163, 74, 0.35); }
    .box.expl { color: var(--ink-soft); }
    .footer-link { margin-top: 32px; font-size: 0.875rem; }
    .footer-link a { color: var(--accent); }
    .sub { font-size: 0.75rem; color: var(--ink-faint); margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrap">
    ${cubitWordmarkHtml()}
    <p class="kicker">Attempt report</p>
    <div class="hairline-accent" aria-hidden="true"></div>
    <h1>${title}</h1>
    ${channel}
    <div class="score-card" aria-label="Score summary">
      <div class="score-row">
        <div class="score-pct">${payload.scorePercent}%</div>
        <span class="pass-pill ${payload.passed ? 'pass' : 'fail'}">${payload.passed ? 'Passed' : 'Not passed'}</span>
      </div>
      <p class="score-detail">${payload.correctCount} of ${payload.totalCount} correct${attemptMeta ? ` · ${escapeHtmlForExport(attemptMeta)}` : ''}</p>
    </div>
    ${sections}
    <section>
      <h2>Questions &amp; answers</h2>
      ${questions}
    </section>
    ${quizLink}
    <p class="sub">Personal attempt snapshot from ${escapeHtmlForExport(BRAND_NAME)}. Includes your answers, correct answers, and explanations.</p>
  </div>
</body>
</html>`;
}

export function downloadQuizAttemptHtmlReport(payload: QuizAttemptHtmlPayload): void {
  const html = buildQuizAttemptHtml(payload);
  downloadHtmlFile(html, `${slugFilename(payload.quizTitle)}-attempt.html`);
}

/** Safe JSON inside &lt;script&gt; (keys stay in page source — offline grading only). */
export function jsonForHtmlScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export type InteractiveQuizItem = {
  question: string;
  type: 'mcq' | 'trueFalse' | 'shortAnswer';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
};

export type GeneratedQuizQuestionLike = {
  type: 'mcq' | 'trueFalse' | 'shortAnswer';
  question: string;
  options?: string[];
  answer?: string;
  correctAnswerIndex?: number;
  explanation?: string;
};

/** Map freshly generated quiz questions (pre-attempt) into shareable HTML items. */
export function mapGeneratedQuestionsToInteractiveItems(
  questions: GeneratedQuizQuestionLike[],
): InteractiveQuizItem[] {
  return questions
    .filter((q) => q.question.trim().length > 0)
    .map((q) => {
      let correctAnswer = String(q.answer ?? '').trim();
      if (
        !correctAnswer &&
        typeof q.correctAnswerIndex === 'number' &&
        q.options?.[q.correctAnswerIndex]
      ) {
        correctAnswer = q.options[q.correctAnswerIndex].trim();
      }
      return {
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer,
        explanation: q.explanation,
      };
    });
}

export type InteractiveQuizHtmlPayload = {
  quizTitle: string;
  channelName?: string;
  passPercent?: number;
  questions: InteractiveQuizItem[];
  takeQuizUrl?: string;
  /** Where to sign in / take the quiz for scored results (defaults to takeQuizUrl or mycubit.app). */
  resultsSignInUrl?: string;
  generatedAt?: string;
};

function formatGeneratedStamp(iso?: string): string {
  if (!iso) return `Generated · ${BRAND_NAME}`;
  const when = Date.parse(iso);
  if (!Number.isFinite(when)) return `Generated · ${BRAND_NAME}`;
  const label = new Date(when).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return `Generated ${label} · ${BRAND_NAME}`;
}

function downloadHtmlFile(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Matches `getC()` quiz-taking chrome in `QuizTaking.tsx`. */
function cubitQuizTakingExportCss(): string {
  return `
    :root {
      --quiz-bg: #ffffff;
      --quiz-bg1: #f7f7f8;
      --quiz-bg2: #efefef;
      --quiz-border: rgba(0, 0, 0, 0.11);
      --quiz-text: #0c0c0e;
      --quiz-text2: #525252;
      --quiz-text3: #737373;
      --quiz-accent: ${BRAND_ACCENT_LIGHT};
      --quiz-accent-dim: rgba(232, 101, 10, 0.09);
      --quiz-card: #ffffff;
      --mono: "IBM Plex Mono", ui-monospace, monospace;
      --display: Inter, system-ui, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --quiz-bg: #050505;
        --quiz-bg1: #0d0d0d;
        --quiz-bg2: #141414;
        --quiz-border: #1c1c1c;
        --quiz-text: #f2f2f2;
        --quiz-text2: #8a8a8a;
        --quiz-text3: #5a5a5a;
        --quiz-accent: #ff7a1a;
        --quiz-accent-dim: rgba(255, 122, 26, 0.12);
        --quiz-card: #0d0d0d;
      }
    }
    * { box-sizing: border-box; }
  body.cuib-app {
      margin: 0;
      min-height: 100vh;
      font-family: var(--display);
      background: var(--quiz-bg);
      color: var(--quiz-text);
      line-height: 1.5;
    }
    .hide { display: none !important; }
    #quiz-shell { display: flex; flex-direction: column; min-height: 100vh; }
    .ready-screen {
      max-width: 36rem;
      margin: 0 auto;
      padding: 2rem 1.25rem 3rem;
    }
    .ready-kicker {
      margin: 0 0 0.5rem;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--quiz-text3);
      font-family: var(--mono);
    }
    .ready-title {
      margin: 0 0 0.5rem;
      font-size: 1.375rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      line-height: 1.35;
    }
    .ready-meta {
      margin: 0 0 1.75rem;
      font-size: 0.8125rem;
      color: var(--quiz-text2);
    }
    .ready-detail {
      border-top: 1px solid var(--quiz-border);
      padding-top: 1.25rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      color: var(--quiz-text2);
    }
    .btn-accent {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      width: 100%;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      background: var(--quiz-accent);
      color: #fff;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .btn-ghost {
      background: transparent;
      border: 1px solid var(--quiz-border);
      color: var(--quiz-text2);
    }
    .quiz-header {
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 1rem 1.5rem;
      background: var(--quiz-card);
      border-bottom: 1px solid var(--quiz-border);
    }
    .quiz-header-inner {
      max-width: 48rem;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .quiz-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--quiz-text);
      text-decoration: none;
    }
    .quiz-logo img { display: block; object-fit: contain; border-radius: 4px; }
    .quiz-logo-name { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.03em; }
    .quiz-header-title {
      display: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--quiz-text2);
    }
    @media (min-width: 768px) {
      .quiz-header-title { display: block; max-width: 14rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }
    .quiz-main { flex: 1; padding: 1.5rem; }
    .quiz-main-inner { max-width: 48rem; margin: 0 auto; }
    .quiz-card {
      border-radius: 1rem;
      overflow: hidden;
      background: var(--quiz-card);
      border: 1px solid var(--quiz-border);
    }
    .quiz-card-body { padding: 1.25rem 1.5rem 1.5rem; }
    .type-pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.25rem 0.75rem;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      background: var(--quiz-bg1);
      color: var(--quiz-text3);
      border: 1px solid var(--quiz-border);
    }
    .question-text {
      margin: 2rem 0;
      font-size: 1.25rem;
      font-weight: 500;
      line-height: 1.55;
      color: var(--quiz-text);
    }
    .option-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .opt-btn {
      width: 100%;
      min-height: 44px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-align: left;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--quiz-border);
      background: var(--quiz-card);
      color: var(--quiz-text);
      font-size: 0.95rem;
      font-family: var(--display);
      cursor: pointer;
    }
    .opt-btn.is-selected {
      background: var(--quiz-accent-dim);
      border-color: var(--quiz-accent);
    }
    .opt-ring {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      border-radius: 999px;
      border: 2px solid var(--quiz-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .opt-btn.is-selected .opt-ring {
      border-color: var(--quiz-accent);
      background: var(--quiz-accent);
    }
    .opt-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: #fff;
      display: none;
    }
    .opt-btn.is-selected .opt-dot { display: block; }
    .text-area {
      width: 100%;
      min-height: 10rem;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--quiz-border);
      background: var(--quiz-card);
      color: var(--quiz-text);
      font-size: 0.95rem;
      font-family: var(--display);
      resize: vertical;
    }
    .quiz-card-footer {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--quiz-border);
    }
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      min-width: 8rem;
    }
    .progress-track {
      height: 4px;
      flex: 1;
      max-width: 10rem;
      border-radius: 999px;
      overflow: hidden;
      background: var(--quiz-bg2);
    }
    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--quiz-accent);
    }
    .progress-label {
      font-size: 0.8rem;
      font-family: var(--mono);
      color: var(--quiz-text2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .nav-btns { display: flex; gap: 0.5rem; }
    .nav-btn {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.625rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--quiz-border);
      background: var(--quiz-card);
      color: var(--quiz-text);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .nav-btn-primary {
      background: var(--quiz-accent);
      border-color: var(--quiz-accent);
      color: #fff;
    }
    .results-panel {
      max-width: 36rem;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    .results-card {
      border: 1px solid var(--quiz-border);
      border-radius: 1rem;
      background: var(--quiz-bg1);
      padding: 1.25rem 1.5rem;
      margin: 1rem 0 1.25rem;
    }
    .results-title {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .results-copy { margin: 0 0 1rem; font-size: 0.875rem; color: var(--quiz-text2); }
    .btn-accent-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      width: 100%;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      background: var(--quiz-accent);
      color: #fff !important;
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
    }
    .footer-note {
      max-width: 48rem;
      margin: 1.5rem auto 0;
      padding: 0 1.5rem 2rem;
      font-size: 0.75rem;
      color: var(--quiz-text3);
    }
    .footer-note a { color: var(--quiz-accent); }
  `;
}

const CUBIT_LOGO_EXPORT = `${CUBIT_APP_ORIGIN}/cubit/cubit-logo.webp`;

function cubitLogoLockupHtml(): string {
  return `<span class="quiz-logo" aria-label="${escapeHtmlForExport(BRAND_NAME)}">
    <img src="${CUBIT_LOGO_EXPORT}" width="18" height="18" alt="" />
    <span class="quiz-logo-name">${escapeHtmlForExport(BRAND_NAME)}</span>
  </span>`;
}

function exportQuestionTypeLabel(type: InteractiveQuizItem['type']): string {
  if (type === 'mcq') return 'Multiple choice';
  if (type === 'trueFalse') return 'True/False';
  return 'Short answer';
}

function buildExportQuestionPanels(questions: InteractiveQuizItem[]): string {
  const total = questions.length;
  return questions
    .map((q, i) => {
      const panelHidden = i === 0 ? '' : ' hide';
      const typeLabel = escapeHtmlForExport(exportQuestionTypeLabel(q.type));
      const qText = escapeHtmlForExport(q.question);
      const progress = total ? Math.round(((i + 1) / total) * 100) : 0;

      let answerBlock = '';
      if ((q.type === 'mcq' || q.type === 'trueFalse') && q.options?.length) {
        answerBlock = `<div class="option-list" role="radiogroup" aria-label="Options for question ${i + 1}">
          ${q.options
            .map(
              (opt) =>
                `<button type="button" class="opt-btn" data-q="${i}" data-value="${escapeHtmlForExport(opt)}">
              <span class="opt-ring" aria-hidden="true"><span class="opt-dot"></span></span>
              <span>${escapeHtmlForExport(opt)}</span>
            </button>`,
            )
            .join('')}
        </div>`;
      } else {
        answerBlock = `<textarea class="text-area" name="q${i}" rows="5" placeholder="Type your answer here..." autocomplete="off"></textarea>`;
      }

      const isLast = i === total - 1;
      const nextLabel = isLast ? 'Submit' : 'Next';

      return `<div class="question-panel${panelHidden}" data-panel="${i}" data-type="${escapeHtmlForExport(q.type)}">
        <article class="quiz-card">
          <div class="quiz-card-body">
            <div style="margin-bottom:2rem"><span class="type-pill">${typeLabel}</span></div>
            <p class="question-text">${qText}</p>
            ${answerBlock}
            ${q.type !== 'shortAnswer' ? `<input type="hidden" name="q${i}" id="answer-${i}" value="" />` : ''}
          </div>
          <div class="quiz-card-footer">
            <div class="progress-wrap">
              <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
                <div class="progress-fill" style="width:${progress}%"></div>
              </div>
              <span class="progress-label">${i + 1} / ${total}</span>
            </div>
            <div class="nav-btns">
              <button type="button" class="nav-btn" data-action="prev" data-panel="${i}" ${i === 0 ? 'disabled' : ''}>Previous</button>
              <button type="button" class="nav-btn ${isLast ? 'nav-btn-primary' : ''}" data-action="${isLast ? 'submit' : 'next'}" data-panel="${i}">${nextLabel}</button>
            </div>
          </div>
        </article>
      </div>`;
    })
    .join('\n');
}

export function buildInteractiveQuizHtml(payload: InteractiveQuizHtmlPayload): string {
  const title = escapeHtmlForExport(payload.quizTitle);
  const passAt = payload.passPercent ?? 70;
  const resultsSignInUrl = escapeHtmlForExport(
    payload.resultsSignInUrl ?? payload.takeQuizUrl ?? CUBIT_APP_ORIGIN,
  );
  const takeQuizUrl = escapeHtmlForExport(payload.takeQuizUrl ?? resultsSignInUrl);
  const questionCount = payload.questions.length;
  const generatedLine = escapeHtmlForExport(formatGeneratedStamp(payload.generatedAt));
  const questionPanels = buildExportQuestionPanels(payload.questions);
  const metaLine = [
    payload.channelName?.trim(),
    `${questionCount} questions`,
    `${passAt}% to pass`,
    generatedLine,
  ]
    .filter(Boolean)
    .join(' · ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${escapeHtmlForExport(BRAND_NAME)} quiz</title>
  ${CUBIT_EXPORT_FONTS}
  <style>${cubitQuizTakingExportCss()}</style>
</head>
<body class="cuib-app">
  <section id="intro" class="ready-screen" aria-labelledby="ready-heading">
    <p class="ready-kicker">Quiz ready</p>
    <h1 id="ready-heading" class="ready-title">${title}</h1>
    <p class="ready-meta">${escapeHtmlForExport(metaLine)}</p>
    <p class="ready-detail">Review the details, then start when you are ready. Scored results are on mycubit.app after you sign in and submit.</p>
    <button type="button" class="btn-accent" id="start-btn">Start quiz</button>
  </section>

  <div id="quiz-shell" class="hide" aria-hidden="true">
    <header class="quiz-header">
      <div class="quiz-header-inner">
        <div style="display:flex;align-items:center;gap:1rem;min-width:0">
          ${cubitLogoLockupHtml()}
          <span class="quiz-header-title">${title}</span>
        </div>
        <button type="button" class="btn-accent" id="header-submit" style="width:auto;padding:0.5rem 1rem;font-size:0.82rem;border-radius:0.75rem">Submit quiz</button>
      </div>
    </header>
    <main class="quiz-main">
      <div class="quiz-main-inner">
        <form id="quiz-form" novalidate>
          ${questionPanels}
        </form>
      </div>
    </main>
  </div>

  <section id="results" class="results-panel hide" aria-live="polite" aria-hidden="true">
    ${cubitLogoLockupHtml()}
    <p class="ready-kicker" style="margin-top:1.25rem">Next step</p>
    <div class="results-card">
      <p class="results-title">Results are on Cubit</p>
      <p class="results-copy">Sign in on mycubit.app, take this quiz there, and your score and question review will appear after you submit.</p>
      <a class="btn-accent-link" href="${resultsSignInUrl}" rel="noopener noreferrer">Sign in on mycubit.app</a>
    </div>
    <button type="button" class="btn-accent btn-ghost" id="retry-btn" style="margin-top:0.75rem">Back to start</button>
  </section>

  <p class="footer-note">Exported from ${escapeHtmlForExport(BRAND_NAME)}. <a href="${takeQuizUrl}">Open on ${escapeHtmlForExport(BRAND_NAME)}</a></p>

  <script>
  (function () {
    var TOTAL = ${questionCount};
    var current = 0;
    var intro = document.getElementById('intro');
    var shell = document.getElementById('quiz-shell');
    var results = document.getElementById('results');
    var startBtn = document.getElementById('start-btn');
    var retryBtn = document.getElementById('retry-btn');
    var headerSubmit = document.getElementById('header-submit');
    var form = document.getElementById('quiz-form');
    var reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function panels() {
      return Array.prototype.slice.call(document.querySelectorAll('.question-panel'));
    }

    function showPanel(index) {
      current = Math.max(0, Math.min(index, TOTAL - 1));
      panels().forEach(function (panel, i) {
        if (i === current) {
          panel.classList.remove('hide');
        } else {
          panel.classList.add('hide');
        }
      });
    }

    function finishToResults() {
      shell.classList.add('hide');
      shell.setAttribute('aria-hidden', 'true');
      results.classList.remove('hide');
      results.removeAttribute('aria-hidden');
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    startBtn.addEventListener('click', function () {
      intro.classList.add('hide');
      intro.setAttribute('aria-hidden', 'true');
      shell.classList.remove('hide');
      shell.removeAttribute('aria-hidden');
      showPanel(0);
    });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var opt = t.closest('.opt-btn');
      if (opt) {
        var q = Number(opt.getAttribute('data-q'));
        var val = opt.getAttribute('data-value') || '';
        var hidden = document.getElementById('answer-' + q);
        if (hidden) hidden.value = val;
        var list = opt.parentElement;
        if (list) {
          list.querySelectorAll('.opt-btn').forEach(function (btn) {
            btn.classList.toggle('is-selected', btn === opt);
          });
        }
        return;
      }
      var nav = t.closest('[data-action]');
      if (!nav) return;
      var action = nav.getAttribute('data-action');
      var panelIdx = Number(nav.getAttribute('data-panel'));
      if (action === 'prev' && panelIdx > 0) {
        showPanel(panelIdx - 1);
        return;
      }
      if (action === 'next' && panelIdx < TOTAL - 1) {
        showPanel(panelIdx + 1);
        return;
      }
      if (action === 'submit') {
        finishToResults();
      }
    });

    headerSubmit.addEventListener('click', function () {
      finishToResults();
    });

    retryBtn.addEventListener('click', function () {
      form.reset();
      document.querySelectorAll('.opt-btn.is-selected').forEach(function (b) { b.classList.remove('is-selected'); });
      results.classList.add('hide');
      results.setAttribute('aria-hidden', 'true');
      shell.classList.add('hide');
      shell.setAttribute('aria-hidden', 'true');
      intro.classList.remove('hide');
      intro.removeAttribute('aria-hidden');
      showPanel(0);
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  })();
  </script>
</body>
</html>`;
}

export function downloadInteractiveQuizHtml(payload: InteractiveQuizHtmlPayload): void {
  const html = buildInteractiveQuizHtml({
    ...payload,
    generatedAt: payload.generatedAt ?? new Date().toISOString(),
  });
  downloadHtmlFile(html, `${slugFilename(payload.quizTitle)}-quiz.html`);
}