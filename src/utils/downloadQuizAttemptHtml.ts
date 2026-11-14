import { BRAND_ACCENT_LIGHT, BRAND_FEEDBACK_RED, BRAND_NAME } from '../brand';

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
  explanation?: string;
};

/** Map freshly generated quiz questions (pre-attempt) into shareable HTML items. */
export function mapGeneratedQuestionsToInteractiveItems(
  questions: GeneratedQuizQuestionLike[],
): InteractiveQuizItem[] {
  return questions
    .filter((q) => q.question.trim().length > 0)
    .map((q) => ({
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: String(q.answer ?? '').trim(),
      explanation: q.explanation,
    }))
    .filter((q) => q.correctAnswer.length > 0);
}

export type InteractiveQuizHtmlPayload = {
  quizTitle: string;
  channelName?: string;
  passPercent?: number;
  questions: InteractiveQuizItem[];
  takeQuizUrl?: string;
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

export function buildInteractiveQuizHtml(payload: InteractiveQuizHtmlPayload): string {
  const title = escapeHtmlForExport(payload.quizTitle);
  const channel = payload.channelName?.trim()
    ? `<p class="meta">${escapeHtmlForExport(payload.channelName)}</p>`
    : '';
  const passAt = payload.passPercent ?? 70;
  const quizLink = payload.takeQuizUrl
    ? `<p class="footer-link"><a href="${escapeHtmlForExport(payload.takeQuizUrl)}">Take on ${escapeHtmlForExport(BRAND_NAME)}</a></p>`
    : '';

  const formQuestions = payload.questions
    .map((q, i) => {
      const qText = escapeHtmlForExport(q.question);
      const name = `q${i}`;
      let inputs = '';
      if (q.type === 'mcq' && q.options && q.options.length > 0) {
        inputs = q.options
          .map(
            (opt, oi) =>
              `<label class="opt"><input type="radio" name="${name}" value="${escapeHtmlForExport(opt)}" /> <span>${escapeHtmlForExport(opt)}</span></label>`,
          )
          .join('');
      } else if (q.type === 'trueFalse') {
        inputs = ['True', 'False']
          .map(
            (opt) =>
              `<label class="opt"><input type="radio" name="${name}" value="${opt}" /> <span>${opt}</span></label>`,
          )
          .join('');
      } else {
        inputs = `<input class="text-in" type="text" name="${name}" autocomplete="off" placeholder="Your answer" />`;
      }
      return `<div class="qcard" data-q="${i}">
        <div class="qhead"><span class="qnum">Q${i + 1}</span> <span class="qtext">${qText}</span></div>
        <div class="opts">${inputs}</div>
      </div>`;
    })
    .join('\n');

  const bank = jsonForHtmlScript(
    payload.questions.map((q) => ({
      type: q.type,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
      options: q.options ?? [],
    })),
  );

  const questionCount = payload.questions.length;
  const generatedLine = escapeHtmlForExport(formatGeneratedStamp(payload.generatedAt));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${escapeHtmlForExport(BRAND_NAME)} quiz</title>
  ${CUBIT_EXPORT_FONTS}
  <style>
    ${cubitExportCss()}
    .intro-card {
      border: 1px solid var(--border);
      background: var(--accent-soft);
      border-radius: 12px;
      padding: 18px 20px;
      margin: 16px 0 24px;
    }
    .intro-stats {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 16px 28px;
      font-size: 0.875rem;
      color: var(--ink-soft);
    }
    .stat-val {
      font-weight: 600;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
    }
    .intro-gen {
      margin: 14px 0 0;
      font-size: 0.75rem;
      color: var(--ink-faint);
      font-family: "IBM Plex Mono", ui-monospace, monospace;
    }
    .intro-title { font-size: clamp(1.35rem, 4vw, 1.75rem); }
    .qcard { border: 1px solid var(--border); background: var(--fill); border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
    .qhead { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; font-weight: 500; font-size: 0.9rem; }
    .qnum { font-family: "IBM Plex Mono", ui-monospace, monospace; font-size: 0.75rem; color: var(--ink-faint); flex-shrink: 0; }
    .opts { display: flex; flex-direction: column; gap: 8px; }
    .opt { display: flex; gap: 10px; align-items: center; font-size: 0.875rem; cursor: pointer; color: var(--ink-soft); min-height: 44px; }
    .opt input { accent-color: var(--accent); }
    .text-in { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--ink); font-size: 16px; }
    .score-card { border: 1px solid var(--border); background: var(--fill); border-radius: 12px; padding: 20px; margin: 8px 0 24px; }
    .score-pct { font-size: 2.5rem; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
    .pill { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border); margin-left: 12px; }
    .pill.pass { color: var(--feedback-ok); background: var(--accent-soft); }
    .pill.fail { color: var(--feedback-bad); }
    .review { margin-top: 8px; }
    .rcard { border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; font-size: 0.875rem; background: var(--surface); }
    .rcard.ok { border-color: rgba(22,163,74,0.35); }
    .rcard.bad { border-color: rgba(239,68,68,0.35); }
    .rlbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-faint); font-family: "IBM Plex Mono", ui-monospace, monospace; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <section id="intro" class="intro" aria-labelledby="intro-title">
      ${cubitWordmarkHtml()}
      <p class="kicker">Shared practice quiz</p>
      <div class="hairline-accent" aria-hidden="true"></div>
      <h1 id="intro-title" class="intro-title">${title}</h1>
      ${channel}
      <div class="intro-card">
        <ul class="intro-stats">
          <li><span class="stat-val">${questionCount}</span> questions</li>
          <li><span class="stat-val">${passAt}%</span> to pass</li>
        </ul>
        <p class="intro-gen">${generatedLine}</p>
      </div>
      <p class="meta">Answer every question, then submit for an instant score in this file. Works offline after download.</p>
      <button type="button" class="primary wide" id="start-btn">Start quiz</button>
    </section>
    <div id="form-wrap" class="hide" aria-hidden="true">
      ${cubitWordmarkHtml()}
      <p class="kicker">Questions</p>
      <div class="hairline" aria-hidden="true"></div>
      <form id="quiz-form" novalidate>
        ${formQuestions}
        <button type="submit" class="primary wide">Submit and see score</button>
      </form>
    </div>
    <div id="results" class="hide" aria-live="polite">
      ${cubitWordmarkHtml()}
      <p class="kicker">Your results</p>
      <div class="score-card">
        <span class="score-pct" id="score-pct">0%</span>
        <span class="pill" id="pass-pill"></span>
        <p class="meta" id="score-line"></p>
      </div>
      <div class="review" id="review"></div>
      <button type="button" class="primary wide ghost" id="retry-btn">Back to start</button>
    </div>
    ${quizLink}
    <p class="sub">Exported from ${escapeHtmlForExport(BRAND_NAME)}. Answer key is used only when you submit.</p>
  </div>
  <script id="cubit-quiz-bank" type="application/json">${bank}</script>
  <script>
  (function () {
    var PASS_AT = ${passAt};
    var bankEl = document.getElementById('cubit-quiz-bank');
    var BANK = JSON.parse(bankEl.textContent || '[]');
    var intro = document.getElementById('intro');
    var startBtn = document.getElementById('start-btn');
    var form = document.getElementById('quiz-form');
    var formWrap = document.getElementById('form-wrap');
    var results = document.getElementById('results');
    var review = document.getElementById('review');
    var retry = document.getElementById('retry-btn');
    var reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function norm(s) {
      return String(s || '').trim().toLowerCase().replace(/\\s+/g, ' ');
    }

    function readAnswer(i) {
      var name = 'q' + i;
      var picked = form.querySelector('input[name="' + name + '"]:checked');
      if (picked) return picked.value;
      var text = form.querySelector('input[name="' + name + '"][type="text"]');
      return text ? text.value : '';
    }

    function grade() {
      var correct = 0;
      var rows = [];
      for (var i = 0; i < BANK.length; i++) {
        var meta = BANK[i];
        var user = readAnswer(i);
        var ok = norm(user) === norm(meta.correctAnswer);
        if (ok) correct++;
        rows.push({ i: i, ok: ok, user: user, meta: meta });
      }
      var total = BANK.length;
      var pct = total ? Math.round((correct / total) * 100) : 0;
      return { correct: correct, total: total, pct: pct, rows: rows };
    }

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    startBtn.addEventListener('click', function () {
      intro.classList.add('hide');
      intro.setAttribute('aria-hidden', 'true');
      formWrap.classList.remove('hide');
      formWrap.setAttribute('aria-hidden', 'false');
      if (!reduceMotion) {
        formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        formWrap.scrollIntoView({ block: 'start' });
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = grade();
      document.getElementById('score-pct').textContent = g.pct + '%';
      var pill = document.getElementById('pass-pill');
      var passed = g.pct >= PASS_AT;
      pill.textContent = passed ? 'Passed' : 'Not passed';
      pill.className = 'pill ' + (passed ? 'pass' : 'fail');
      document.getElementById('score-line').textContent = g.correct + ' of ' + g.total + ' correct';
      review.innerHTML = g.rows.map(function (r) {
        var qEl = document.querySelector('.qcard[data-q="' + r.i + '"] .qtext');
        var qText = qEl ? qEl.textContent : 'Question ' + (r.i + 1);
        var expl = r.meta.explanation ? '<div class="rlbl">Explanation</div><div>' + esc(r.meta.explanation) + '</div>' : '';
        return '<div class="rcard ' + (r.ok ? 'ok' : 'bad') + '">' +
          '<strong>' + esc(qText) + '</strong>' +
          '<div class="rlbl">Your answer</div><div>' + esc(r.user || '—') + '</div>' +
          (!r.ok ? '<div class="rlbl">Correct answer</div><div>' + esc(r.meta.correctAnswer) + '</div>' : '') +
          expl + '</div>';
      }).join('');
      formWrap.classList.add('hide');
      formWrap.setAttribute('aria-hidden', 'true');
      results.classList.remove('hide');
      results.removeAttribute('aria-hidden');
      if (!reduceMotion) {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        results.scrollIntoView({ block: 'start' });
      }
    });

    retry.addEventListener('click', function () {
      form.reset();
      review.innerHTML = '';
      results.classList.add('hide');
      results.setAttribute('aria-hidden', 'true');
      formWrap.classList.add('hide');
      formWrap.setAttribute('aria-hidden', 'true');
      intro.classList.remove('hide');
      intro.removeAttribute('aria-hidden');
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