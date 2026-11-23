import { useState } from 'react';
import { CirclePlay, FileText, Globe, ListVideo } from 'lucide-react';
import { playlist } from '../model';

const EXAMPLES = [
  { label: 'SAT Math playlist', url: playlist.url, icon: ListVideo },
  { label: 'One YouTube video', url: 'https://www.youtube.com/watch?v=sat-math-linear', icon: CirclePlay },
  { label: 'Web page', url: 'https://example.com/sat-math-notes', icon: Globe },
  { label: 'PDF', url: 'https://example.com/sat-math.pdf', icon: FileText },
];

export function EmptyState({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [text, setText] = useState('');

  return (
    <div data-testid="studio-empty" className="studio-empty">
      <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--ink)]">What should Cubit AI turn into a course?</h2>
      <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-[var(--ink-soft)]">
        Paste a link. Cubit AI builds the lessons, notes and questions, then you change anything by asking.
      </p>
      <form
        className="mx-auto mt-5 flex max-w-xl items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-4 pr-1 text-left"
        onSubmit={(event) => {
          event.preventDefault();
          if (text.trim()) onSubmit(text.trim());
        }}
      >
        <input
          data-testid="composer-input"
          value={text}
          placeholder="Paste a YouTube video, playlist, web page or PDF link"
          className="h-11 min-w-0 flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" data-testid="composer-send" data-accent="primary" aria-label="Send" className="grid size-11 place-items-center rounded-full bg-[var(--accent)] text-white">
          ↑
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => {
          const Icon = example.icon;
          return (
            <button
              key={example.label}
              type="button"
              data-testid="example-chip"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-[12px] text-[var(--ink)] md:h-9"
              onClick={() => onSubmit(example.url)}
            >
              <Icon size={13} />
              {example.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
