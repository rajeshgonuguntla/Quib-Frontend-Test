import { jsPDF } from 'jspdf';

export type DownloadableLesson = {
  title: string;
  duration?: string;
  type?: string;
  summary?: string;
  keyConcepts?: string[];
  takeaway?: string;
  notes?: string;
};

export type DownloadableQuizQuestion = {
  question: string;
  options: string[];
  answer?: number;
};

export type DownloadableModule = {
  title: string;
  description?: string;
  lessons: DownloadableLesson[];
  quiz?: DownloadableQuizQuestion[];
};

export type DownloadableCourse = {
  title: string;
  description?: string;
  difficulty?: string;
  date?: string;
  modules: DownloadableModule[];
  channelName?: string;
  videoTitle?: string;
};

const MARGIN = 48;
const PAGE_W = 595.28; // A4 pt
const PAGE_H = 841.89;
const CONTENT_W = PAGE_W - MARGIN * 2;
const LOGO_SIZE = 36;
import { BRAND_NAME } from '../brand';

const BRAND = BRAND_NAME;
const ACCENT: [number, number, number] = [225, 6, 0];
const TEXT: [number, number, number] = [28, 28, 32];
const MUTED: [number, number, number] = [100, 100, 110];

type InlineSeg = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

type MdBlock =
  | { kind: 'h2' | 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'code'; language?: string; code: string };

type Writer = {
  doc: jsPDF;
  y: number;
  logoDataUrl: string | null;
};

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return slug || 'course';
}

async function loadQuibLogoPng(): Promise<string> {
  const res = await fetch('/cube_logo_light.svg');
  const svg = await res.text();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Failed to load Cuib logo'));
      el.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Parse inline markdown: **bold**, *italic*, `code`. */
function parseInline(text: string): InlineSeg[] {
  const parts: InlineSeg[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`\n]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ text: text.slice(last, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push({ text: token.slice(2, -2), bold: true });
    } else if (token.startsWith('*')) {
      parts.push({ text: token.slice(1, -1), italic: true });
    } else {
      parts.push({ text: token.slice(1, -1), code: true });
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    parts.push({ text: text.slice(last) });
  }

  return parts.length ? parts : [{ text }];
}

/** Block-level markdown for a non-fenced segment. */
function parseTextBlocks(text: string): MdBlock[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: MdBlock[] = [];
  let listItems: string[] = [];
  let paragraph: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({ kind: 'ul', items: [...listItems] });
    listItems = [];
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      flushParagraph();
      blocks.push({ kind: 'h3', text: trimmed.slice(4).trim() });
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      flushParagraph();
      blocks.push({ kind: 'h2', text: trimmed.slice(3).trim() });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    // Indented code line (4 spaces or tab) — treat as a one-line code block chunk
    if (/^( {4}|\t)/.test(line)) {
      flushList();
      flushParagraph();
      const codeLine = line.replace(/^( {4}|\t)/, '');
      const prev = blocks[blocks.length - 1];
      if (prev?.kind === 'code' && !prev.language) {
        prev.code += `\n${codeLine}`;
      } else {
        blocks.push({ kind: 'code', code: codeLine });
      }
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushList();
  flushParagraph();
  return blocks;
}

/**
 * Full markdown parse: fenced ``` blocks (same rules as LessonNotes) +
 * headings, lists, paragraphs, inline styles.
 */
function parseMarkdownBlocks(text: string): MdBlock[] {
  const normalized = text.replace(/\r\n/g, '\n');
  const segments = normalized.split(/```/);
  const blocks: MdBlock[] = [];

  segments.forEach((segment, index) => {
    if (index % 2 === 1) {
      // Fenced code: optional language on first line
      const match = segment.match(/^(?:([a-zA-Z0-9_+-]+)\n)?([\s\S]*)$/);
      const language = match?.[1];
      const code = (match?.[2] ?? segment).replace(/^\n/, '').replace(/\n$/, '');
      blocks.push({ kind: 'code', language, code });
      return;
    }
    if (!segment.trim()) return;
    blocks.push(...parseTextBlocks(segment));
  });

  return blocks;
}

function setSegFont(doc: jsPDF, seg: InlineSeg, size: number) {
  doc.setFontSize(size);
  if (seg.code) {
    doc.setFont('courier', 'normal');
    doc.setTextColor(...ACCENT);
  } else if (seg.bold && seg.italic) {
    doc.setFont('helvetica', 'boldoblique');
    doc.setTextColor(...TEXT);
  } else if (seg.bold) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT);
  } else if (seg.italic) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...MUTED);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT);
  }
}

function measureSeg(doc: jsPDF, seg: InlineSeg, size: number): number {
  setSegFont(doc, seg, size);
  return doc.getTextWidth(seg.text);
}

/** Word-wrap mixed-style segments across lines. */
function wrapRichSegments(
  doc: jsPDF,
  segments: InlineSeg[],
  maxWidth: number,
  fontSize: number,
): InlineSeg[][] {
  const lines: InlineSeg[][] = [[]];
  let lineWidth = 0;

  const pushSeg = (seg: InlineSeg) => {
    const w = measureSeg(doc, seg, fontSize);
    if (lineWidth > 0 && lineWidth + w > maxWidth) {
      lines.push([]);
      lineWidth = 0;
    }
    // If a single word is wider than the line, still place it (avoid infinite loop).
    lines[lines.length - 1].push(seg);
    lineWidth += w;
  };

  for (const seg of segments) {
    if (!seg.text) continue;
    const words = seg.text.split(/(\s+)/);
    for (const word of words) {
      if (!word) continue;
      pushSeg({ ...seg, text: word });
    }
  }

  return lines.filter((line) => line.some((s) => s.text.trim().length > 0 || s.text === ' '));
}

function ensureSpace(w: Writer, needed: number) {
  if (w.y + needed <= PAGE_H - MARGIN) return;
  w.doc.addPage();
  w.y = MARGIN;
  drawPageChrome(w);
}

function drawPageChrome(w: Writer) {
  const { doc, logoDataUrl } = w;
  const logoX = PAGE_W - MARGIN - LOGO_SIZE;
  const logoY = 18;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', logoX, logoY, LOGO_SIZE, LOGO_SIZE);
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...ACCENT);
  const brandWidth = doc.getTextWidth(BRAND);
  doc.text(BRAND, logoX - 6 - brandWidth, logoY + LOGO_SIZE / 2 + 3);

  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, 64, PAGE_W - MARGIN, 64);

  if (w.y < 80) w.y = 80;
}

function drawPlainWrapped(
  w: Writer,
  text: string,
  opts: {
    size: number;
    bold?: boolean;
    color?: [number, number, number];
    indent?: number;
    lineH?: number;
  },
) {
  if (!text.trim()) return;
  const indent = opts.indent ?? 0;
  const maxW = CONTENT_W - indent;
  const lineH = opts.lineH ?? opts.size * 1.35;
  w.doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
  w.doc.setFontSize(opts.size);
  w.doc.setTextColor(...(opts.color ?? TEXT));
  const lines = w.doc.splitTextToSize(text.replace(/\s+/g, ' ').trim(), maxW) as string[];
  for (const line of lines) {
    ensureSpace(w, lineH);
    w.doc.text(line, MARGIN + indent, w.y);
    w.y += lineH;
  }
}

function drawRichText(
  w: Writer,
  text: string,
  opts: { size?: number; indent?: number; muted?: boolean } = {},
) {
  if (!text?.trim()) return;
  const size = opts.size ?? 10;
  const indent = opts.indent ?? 0;
  const lineH = size * 1.45;
  const maxW = CONTENT_W - indent;
  const segments = parseInline(text);
  if (opts.muted) {
    for (const seg of segments) {
      if (!seg.bold && !seg.code) seg.italic = true;
    }
  }
  const lines = wrapRichSegments(w.doc, segments, maxW, size);

  for (const line of lines) {
    ensureSpace(w, lineH);
    let x = MARGIN + indent;
    for (const seg of line) {
      setSegFont(w.doc, seg, size);
      const tw = w.doc.getTextWidth(seg.text);
      if (seg.code && seg.text.trim()) {
        const padX = 2;
        const padY = 1.5;
        w.doc.setFillColor(242, 242, 245);
        w.doc.roundedRect(x - padX, w.y - size + 1.5, tw + padX * 2, size + padY * 2, 1.5, 1.5, 'F');
        setSegFont(w.doc, seg, size);
      }
      w.doc.text(seg.text, x, w.y);
      x += tw;
    }
    w.y += lineH;
  }
  w.y += 3;
}

/** Wrap a single code line in courier without collapsing whitespace. */
function wrapCodeLine(doc: jsPDF, line: string, maxWidth: number, fontSize: number): string[] {
  doc.setFont('courier', 'normal');
  doc.setFontSize(fontSize);
  if (!line) return [''];
  if (doc.getTextWidth(line) <= maxWidth) return [line];

  const out: string[] = [];
  let current = '';
  for (const ch of line) {
    const next = current + ch;
    if (current && doc.getTextWidth(next) > maxWidth) {
      out.push(current);
      current = ch;
    } else {
      current = next;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [''];
}

function drawCodeBlock(w: Writer, code: string, language?: string) {
  const size = 8.5;
  const lineH = size * 1.45;
  const padX = 10;
  const padY = 8;
  const innerW = CONTENT_W - padX * 2;
  const rawLines = code.replace(/\t/g, '  ').split('\n');
  const wrapped: string[] = [];
  for (const raw of rawLines) {
    wrapped.push(...wrapCodeLine(w.doc, raw, innerW, size));
  }
  if (!wrapped.length) wrapped.push('');

  let i = 0;
  while (i < wrapped.length) {
    const avail = PAGE_H - MARGIN - w.y;
    const headerH = language && i === 0 ? 14 : 0;
    const minBox = padY * 2 + headerH + lineH;
    if (avail < minBox + 8) {
      w.doc.addPage();
      w.y = MARGIN;
      drawPageChrome(w);
    }

    const usable = PAGE_H - MARGIN - w.y - padY * 2 - headerH;
    const linesThisPage = Math.max(1, Math.min(wrapped.length - i, Math.floor(usable / lineH)));
    const boxH = padY * 2 + headerH + linesThisPage * lineH;

    ensureSpace(w, boxH);

    const boxTop = w.y;
    w.doc.setFillColor(246, 246, 248);
    w.doc.setDrawColor(220, 220, 226);
    w.doc.setLineWidth(0.6);
    w.doc.roundedRect(MARGIN, boxTop, CONTENT_W, boxH, 4, 4, 'FD');

    let textY = boxTop + padY + size;
    if (language && i === 0) {
      w.doc.setFont('helvetica', 'bold');
      w.doc.setFontSize(7);
      w.doc.setTextColor(...MUTED);
      w.doc.text(language.toUpperCase(), MARGIN + padX, textY);
      textY += 12;
    }

    w.doc.setFont('courier', 'normal');
    w.doc.setFontSize(size);
    w.doc.setTextColor(40, 40, 48);
    for (let n = 0; n < linesThisPage; n++) {
      w.doc.text(wrapped[i + n], MARGIN + padX, textY);
      textY += lineH;
    }

    w.y = boxTop + boxH + 8;
    i += linesThisPage;
  }
}

function addMarkdown(w: Writer, text: string, size = 10) {
  if (!text?.trim()) return;
  const blocks = parseMarkdownBlocks(text);

  for (const block of blocks) {
    if (block.kind === 'code') {
      drawCodeBlock(w, block.code, block.language);
      continue;
    }
    if (block.kind === 'h2') {
      w.y += 4;
      drawPlainWrapped(w, stripInlineMarkers(block.text), {
        size: size + 2,
        bold: true,
        lineH: (size + 2) * 1.3,
      });
      w.y += 2;
      continue;
    }
    if (block.kind === 'h3') {
      w.y += 3;
      drawPlainWrapped(w, stripInlineMarkers(block.text), {
        size: size + 1,
        bold: true,
        lineH: (size + 1) * 1.3,
      });
      w.y += 2;
      continue;
    }
    if (block.kind === 'ul') {
      for (const item of block.items) {
        ensureSpace(w, size * 1.45);
        w.doc.setFont('helvetica', 'normal');
        w.doc.setFontSize(size);
        w.doc.setTextColor(...TEXT);
        w.doc.text('•', MARGIN, w.y);
        const startY = w.y;
        drawRichText(w, item, { size, indent: 14 });
        if (w.y === startY) w.y += size * 1.45;
      }
      w.y += 2;
      continue;
    }
    drawRichText(w, block.text, { size });
  }
  w.y += 2;
}

/** Strip markers for headings drawn as plain bold (markers already parsed as text). */
function stripInlineMarkers(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function addHeading(w: Writer, text: string, size: number, color: [number, number, number] = TEXT) {
  drawPlainWrapped(w, text, { size, bold: true, color, lineH: size * 1.25 });
  w.y += 4;
}

function addLabel(w: Writer, label: string) {
  ensureSpace(w, 16);
  w.doc.setFont('helvetica', 'bold');
  w.doc.setFontSize(8);
  w.doc.setTextColor(...ACCENT);
  w.doc.text(label.toUpperCase(), MARGIN, w.y);
  w.y += 12;
}

function addMuted(w: Writer, text: string, size = 9) {
  drawPlainWrapped(w, text, { size, color: MUTED, lineH: size * 1.35 });
  w.y += 2;
}

function addFooter(doc: jsPDF, pageCount: number) {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W / 2, PAGE_H - 24, { align: 'center' });
  }
}

/** Download a neatly formatted PDF of the course with the Cuib logo top-right. */
export async function downloadCoursePdf(course: DownloadableCourse): Promise<void> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadQuibLogoPng();
  } catch {
    logoDataUrl = null;
  }

  const w: Writer = { doc, y: MARGIN, logoDataUrl };
  drawPageChrome(w);

  addHeading(w, course.title, 22);
  if (course.description) addMarkdown(w, course.description, 11);

  const metaParts = [
    course.difficulty ? `Difficulty: ${course.difficulty}` : null,
    course.date ? `Date: ${course.date}` : null,
    course.channelName ? `Channel: ${course.channelName}` : null,
    `${course.modules.length} module${course.modules.length === 1 ? '' : 's'}`,
  ].filter(Boolean) as string[];
  if (metaParts.length) addMuted(w, metaParts.join('  ·  '), 9);

  w.y += 8;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, w.y, MARGIN + 48, w.y);
  w.y += 18;

  course.modules.forEach((mod, modIdx) => {
    ensureSpace(w, 40);
    addHeading(w, `${modIdx + 1}. ${mod.title}`, 14);
    if (mod.description) addMarkdown(w, mod.description, 10);

    mod.lessons.forEach((lesson, lessonIdx) => {
      ensureSpace(w, 28);
      const typeLabel = lesson.type ? lesson.type.toUpperCase() : 'LESSON';
      const duration = lesson.duration ? ` · ${lesson.duration}` : '';
      addHeading(w, `${modIdx + 1}.${lessonIdx + 1}  ${lesson.title}`, 11);
      addMuted(w, `${typeLabel}${duration}`, 8);

      if (lesson.summary) {
        addLabel(w, 'Summary');
        addMarkdown(w, lesson.summary, 10);
      }
      if (lesson.keyConcepts?.length) {
        addLabel(w, 'Key concepts');
        for (const concept of lesson.keyConcepts) {
          ensureSpace(w, 14);
          w.doc.setFont('helvetica', 'normal');
          w.doc.setFontSize(10);
          w.doc.setTextColor(...TEXT);
          w.doc.text('•', MARGIN, w.y);
          drawRichText(w, concept, { size: 10, indent: 14 });
        }
        w.y += 4;
      }
      if (lesson.takeaway) {
        addLabel(w, 'Takeaway');
        addMarkdown(w, lesson.takeaway, 10);
      }
      if (lesson.notes) {
        addLabel(w, 'Study notes');
        addMarkdown(w, lesson.notes, 10);
      }
      w.y += 6;
    });

    if (mod.quiz?.length) {
      ensureSpace(w, 28);
      addHeading(w, 'Module quiz', 11, ACCENT);
      mod.quiz.forEach((q, qi) => {
        drawRichText(w, `**Q${qi + 1}.** ${q.question}`, { size: 10 });
        q.options.forEach((opt, oi) => {
          const letter = String.fromCharCode(65 + oi);
          const isCorrect = q.answer === oi;
          drawRichText(w, isCorrect ? `**${letter}.** ${opt} ✓` : `${letter}. ${opt}`, {
            size: 9,
            indent: 12,
            muted: !isCorrect,
          });
        });
        w.y += 4;
      });
    }

    w.y += 10;
  });

  addFooter(doc, doc.getNumberOfPages());
  doc.save(`${slugify(course.title)}-cuib-course.pdf`);
}
