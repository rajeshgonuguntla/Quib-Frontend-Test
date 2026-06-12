import type { ReactNode } from 'react';

type NotesTheme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  bg2: string;
  red: string;
};

function formatInline(text: string, theme: NotesTheme): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} style={{ color: theme.text, fontWeight: 600 }}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded text-[0.8em]"
          style={{ background: theme.bg2, color: theme.red, fontFamily: 'var(--mono)' }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts.length ? parts : [text];
}

function renderTextBlock(text: string, theme: NotesTheme) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={key++} className="list-disc pl-5 space-y-1 mb-3">
        {listItems.map((item, i) => (
          <li key={i} className="text-[0.875rem] leading-relaxed" style={{ color: theme.text2 }}>
            {formatInline(item, theme)}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      nodes.push(
        <h3
          key={key++}
          className="text-[0.95rem] font-[600] mt-5 mb-2 first:mt-0"
          style={{ color: theme.text, fontFamily: 'var(--serif)' }}
        >
          {line.slice(4).trim()}
        </h3>,
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      nodes.push(
        <h2 key={key++} className="text-[1.05rem] font-[600] mt-5 mb-2" style={{ color: theme.text }}>
          {line.slice(3).trim()}
        </h2>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    flushList();
    nodes.push(
      <p key={key++} className="text-[0.875rem] leading-relaxed mb-3" style={{ color: theme.text2, lineHeight: 1.8 }}>
        {formatInline(line, theme)}
      </p>,
    );
  }

  flushList();
  return nodes;
}

export function LessonNotes({ content, theme }: { content: string; theme: NotesTheme }) {
  const segments = content.split(/```/);

  return (
    <div className="lesson-notes">
      {segments.map((segment, index) => {
        if (index % 2 === 1) {
          const lines = segment.replace(/^\w*\n?/, '').trimEnd();
          return (
            <pre
              key={index}
              className="rounded-xl p-4 mb-4 overflow-x-auto text-[0.8rem] leading-relaxed"
              style={{
                background: theme.bg2,
                border: `1px solid ${theme.border}`,
                color: theme.text2,
                fontFamily: 'var(--mono)',
              }}
            >
              <code>{lines}</code>
            </pre>
          );
        }

        if (!segment.trim()) {
          return null;
        }

        return <div key={index}>{renderTextBlock(segment, theme)}</div>;
      })}
    </div>
  );
}

export function LessonStudyContent({
  lesson,
  theme,
  moduleTitle,
}: {
  lesson: {
    title: string;
    summary?: string;
    keyConcepts?: string[];
    takeaway?: string;
    notes?: string;
    type: 'video' | 'reading';
  };
  theme: NotesTheme;
  moduleTitle?: string;
}) {
  const hasRich =
    lesson.summary?.trim() ||
    (lesson.keyConcepts && lesson.keyConcepts.length > 0) ||
    lesson.takeaway?.trim() ||
    lesson.notes?.trim();

  if (!hasRich) {
    return (
      <div className="rounded-2xl p-6 mb-8" style={{ background: theme.bg1, border: `1px solid ${theme.border}` }}>
        <p className="text-[0.875rem] leading-relaxed" style={{ color: theme.text2, lineHeight: 1.8 }}>
          This lesson covers <strong style={{ color: theme.text }}>{lesson.title}</strong>
          {moduleTitle ? (
            <>
              {' '}
              as part of <em>{moduleTitle}</em>
            </>
          ) : null}
          . Follow along with the {lesson.type === 'video' ? 'video' : 'reading material'} and note the key concepts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {lesson.summary?.trim() ? (
        <div className="rounded-2xl p-6" style={{ background: theme.bg1, border: `1px solid ${theme.border}` }}>
          <p className="text-[0.7rem] uppercase tracking-widest mb-3" style={{ color: theme.text3, fontFamily: 'var(--mono)' }}>
            Summary
          </p>
          <p className="text-[0.875rem] leading-relaxed" style={{ color: theme.text2, lineHeight: 1.8 }}>
            {lesson.summary}
          </p>
        </div>
      ) : null}

      {lesson.keyConcepts && lesson.keyConcepts.length > 0 ? (
        <div className="rounded-2xl p-6" style={{ background: theme.bg1, border: `1px solid ${theme.border}` }}>
          <p className="text-[0.7rem] uppercase tracking-widest mb-3" style={{ color: theme.text3, fontFamily: 'var(--mono)' }}>
            Key concepts
          </p>
          <ul className="list-disc pl-5 space-y-2">
            {lesson.keyConcepts.map((concept, i) => (
              <li key={i} className="text-[0.875rem] leading-relaxed" style={{ color: theme.text2 }}>
                {concept}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lesson.takeaway?.trim() ? (
        <div
          className="rounded-2xl p-5"
          style={{ background: theme.bg1, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${theme.red}` }}
        >
          <p className="text-[0.7rem] uppercase tracking-widest mb-2" style={{ color: theme.red, fontFamily: 'var(--mono)' }}>
            Takeaway
          </p>
          <p className="text-[0.875rem] leading-relaxed font-[500]" style={{ color: theme.text }}>
            {lesson.takeaway}
          </p>
        </div>
      ) : null}

      {lesson.notes?.trim() ? (
        <div className="rounded-2xl p-6" style={{ background: theme.bg1, border: `1px solid ${theme.border}` }}>
          <p className="text-[0.7rem] uppercase tracking-widest mb-4" style={{ color: theme.text3, fontFamily: 'var(--mono)' }}>
            Study notes
          </p>
          <LessonNotes content={lesson.notes} theme={theme} />
        </div>
      ) : null}
    </div>
  );
}
