import { useState } from 'react';
import { Check, ListVideo } from 'lucide-react';
import type { DiffOp, PlaylistVideo, StudioCard } from '../model';
import { playlist } from '../model';

function richParts(text: string) {
  const parts: Array<{ bold: boolean; text: string }> = [];
  let bold = false;
  for (const part of text.split(/(<\/?b>)/)) {
    if (part === '<b>') {
      bold = true;
    } else if (part === '</b>') {
      bold = false;
    } else if (part) {
      parts.push({ bold, text: part });
    }
  }
  return parts;
}

function Rich({ text }: { text: string }) {
  return (
    <>
      {richParts(text).map((part, index) => (
        part.bold ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>
      ))}
    </>
  );
}

export function SummaryCard({ card }: { card: Extract<StudioCard, { type: 'summary' }> }) {
  const cells = [
    { label: 'Modules', value: String(card.counts.modules) },
    { label: 'Lessons', value: String(card.counts.lessons) },
    { label: 'Drills', value: String(card.counts.drills), sub: `${card.counts.questions} questions` },
    { label: 'Flashcards', value: String(card.counts.decks), sub: `${card.counts.cards} cards` },
    { label: 'Fill in the blanks', value: String(card.counts.blanks) },
    { label: 'Mock test', value: String(card.counts.mocks) },
  ];
  return (
    <section data-testid="summary-card" className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-3 py-2">
        <p className="text-label text-[10px] text-[var(--ink-faint)]">Course summary</p>
        <p className="truncate text-[13px] font-semibold text-[var(--ink)]">{card.title}</p>
      </div>
      <div className="grid grid-cols-3">
        {cells.map((cell) => (
          <div key={cell.label} data-testid="summary-count" className="border-b border-r border-[var(--border)] px-3 py-2.5 last:border-r-0">
            <p className="text-label text-[10px] text-[var(--ink-faint)]">{cell.label}</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[var(--ink)]">{cell.value}</p>
            {cell.sub ? <p className="text-[11px] text-[var(--ink-soft)]">{cell.sub}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function DiffCard({ card }: { card: Extract<StudioCard, { type: 'diff' }> }) {
  const [ops, setOps] = useState(card.ops);
  const setStatus = (id: string, status: DiffOp['status']) => {
    setOps((current) => current.map((op) => (op.id === id ? { ...op, status } : op)));
  };
  return (
    <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-label text-[10px] text-[var(--ink-faint)]">{card.title}</p>
      <ul className="mt-2 space-y-3">
        {ops.map((op) => (
          <li key={op.id}>
            <p className="text-[13px] leading-relaxed text-[var(--ink)]">
              <Rich text={op.summary} />
            </p>
            {op.op.type === 'add_questions' && op.op.questions ? (
              <ol className="mt-2 space-y-1.5 pl-4 text-[13px] text-[var(--ink-soft)]">
                {op.op.questions.map((question) => (
                  <li key={question.id}>
                    <span className="font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">Q{question.n}</span>{' '}
                    {question.prompt}
                  </li>
                ))}
              </ol>
            ) : null}
            {op.op.type === 'update_notes' && op.op.notes ? (
              <ul className="mt-2 space-y-1.5">
                {op.op.notes.map((note) => (
                  <li key={note.at} className="flex gap-3 text-[13px]">
                    <span className="font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{note.at}</span>
                    <span className="text-[var(--ink-soft)]">{note.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-2 flex gap-2">
              {op.status === 'pending' ? (
                <>
                  <button type="button" className="h-11 rounded-md border border-[var(--border)] px-3 text-[12px] font-semibold text-[var(--ink)] md:h-8" onClick={() => setStatus(op.id, 'accepted')}>
                    Accept
                  </button>
                  <button type="button" className="h-11 rounded-md px-3 text-[12px] font-semibold text-[var(--ink-soft)] md:h-8" onClick={() => setStatus(op.id, 'rejected')}>
                    Reject
                  </button>
                </>
              ) : (
                <p className="text-[12px] text-[var(--ink-soft)]">{op.status === 'accepted' ? 'Accepted' : 'Rejected'}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SettingsCard({ card }: { card: Extract<StudioCard, { type: 'settings' }> }) {
  const [status, setStatus] = useState(card.status);
  const [visibility, setVisibility] = useState(card.visibility);
  const [publish, setPublish] = useState(card.publish);
  return (
    <section data-testid="settings-card" className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-label text-[10px] text-[var(--ink-faint)]">Course settings</p>
      <p className="mt-1 text-[14px] font-semibold text-[var(--ink)]">{card.title}</p>
      {card.show.includes('access') ? (
        <div className="mt-3 space-y-2">
          {(['public', 'private'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={visibility === option}
              data-testid="settings-visibility-option"
              disabled={status !== 'pending'}
              className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-left text-[13px] text-[var(--ink)]"
              onClick={() => setVisibility(option)}
            >
              <span className="grid size-4 place-items-center rounded-full border border-[var(--border)]">
                {visibility === option ? <span className="size-2 rounded-full bg-[var(--ink)]" /> : null}
              </span>
              {option === 'public' ? 'Public link' : 'Private'}
            </button>
          ))}
        </div>
      ) : null}
      {card.show.includes('publish') ? (
        <button
          type="button"
          role="switch"
          aria-checked={publish}
          data-testid="settings-publish-switch"
          disabled={status !== 'pending'}
          className="mt-3 flex h-11 w-full items-center justify-between rounded-lg border border-[var(--border)] px-3 text-[13px] text-[var(--ink)]"
          onClick={() => setPublish((value) => !value)}
        >
          Publish
          <span className={`h-5 w-9 rounded-full p-0.5 ${publish ? 'bg-[var(--accent)]' : 'bg-[var(--fill)]'}`} data-accent={publish ? 'progress' : undefined}>
            <span className={`block size-4 rounded-full bg-white ${publish ? 'ml-auto' : ''}`} />
          </span>
        </button>
      ) : null}
      {status === 'pending' ? (
        <div className="mt-3 flex gap-2">
          <button type="button" data-testid="settings-confirm" data-accent="primary" className="h-10 flex-1 rounded-lg bg-[var(--accent)] text-[13px] font-semibold text-white" onClick={() => setStatus('confirmed')}>
            Confirm
          </button>
          <button type="button" data-testid="settings-cancel" className="h-10 rounded-lg px-3 text-[13px] font-semibold text-[var(--ink-soft)]" onClick={() => setStatus('cancelled')}>
            Cancel
          </button>
        </div>
      ) : (
        <p data-testid="settings-summary" className="mt-3 text-[12px] text-[var(--ink-soft)]">
          {status === 'confirmed' ? `Saved as ${visibility}${publish ? ', published' : ''}.` : 'Cancelled.'}
        </p>
      )}
    </section>
  );
}

export function SourceCard({ onGenerate }: { onGenerate: () => void }) {
  const [videos, setVideos] = useState<PlaylistVideo[]>(playlist.videos);
  const [title, setTitle] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description);
  const [titleHint, setTitleHint] = useState(true);
  const [descriptionHint, setDescriptionHint] = useState(true);
  const selected = videos.filter((video) => video.selected);
  const allSelected = selected.length === videos.length;
  const minutes = selected.reduce((sum, video) => {
    const [m, s] = video.duration.split(':').map(Number);
    return sum + m + (s >= 30 ? 1 : 0);
  }, 0);
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;

  return (
    <section data-testid="source-card" className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left">
      <p data-testid="source-detected" className="flex items-center gap-2 text-[13px] font-semibold text-[var(--ink)]">
        <ListVideo size={16} />
        {playlist.detectedLabel}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2 text-[12px] text-[var(--ink-soft)]">
        <span data-testid="source-selected-count">
          {videos.length} videos · {selected.length} selected · {hours} h {remain} m
        </span>
        <button
          type="button"
          data-testid="source-select-all"
          data-accent="link"
          className="font-semibold text-[var(--accent)]"
          onClick={() => setVideos((current) => current.map((video) => ({ ...video, selected: !allSelected })))}
        >
          {allSelected ? 'Clear all' : 'Select all'}
        </button>
      </div>
      <ul className="mt-2 max-h-64 space-y-1 overflow-auto">
        {videos.map((video) => (
          <li key={video.id}>
            <button
              type="button"
              data-testid="source-pick"
              aria-pressed={video.selected}
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-1 text-left"
              onClick={() => setVideos((current) => current.map((item) => (item.id === video.id ? { ...item, selected: !item.selected } : item)))}
            >
              <span
                data-accent={video.selected ? 'progress' : undefined}
                className={`grid size-5 shrink-0 place-items-center rounded border ${video.selected ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[var(--border)]'}`}
              >
                {video.selected ? <Check size={12} /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-[var(--ink)]">{video.title}</span>
                {video.captions ? <span className="block text-[11px] text-[var(--ink-faint)]">Captions available</span> : null}
              </span>
              <span className="font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{video.duration}</span>
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-4 block text-label text-[10px] text-[var(--ink-faint)]" htmlFor="source-title">Title</label>
      <input
        id="source-title"
        data-testid="source-title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setTitleHint(false);
        }}
        className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-[16px] text-[var(--ink)] outline-none md:text-[14px]"
      />
      {titleHint ? <p data-testid="prefill-hint" className="mt-1 text-[11px] text-[var(--ink-faint)]">From playlist</p> : null}
      <label className="mt-3 block text-label text-[10px] text-[var(--ink-faint)]" htmlFor="source-desc">Description</label>
      <textarea
        id="source-desc"
        data-testid="source-desc"
        value={description}
        rows={3}
        onChange={(event) => {
          setDescription(event.target.value);
          setDescriptionHint(false);
        }}
        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[16px] text-[var(--ink)] outline-none md:text-[14px]"
      />
      {descriptionHint ? <p data-testid="prefill-hint" className="mt-1 text-[11px] text-[var(--ink-faint)]">From playlist</p> : null}
      <button
        type="button"
        data-testid="source-generate"
        data-accent="primary"
        disabled={selected.length === 0 || title.trim() === ''}
        className="mt-4 h-11 w-full rounded-lg bg-[var(--accent)] text-[14px] font-semibold text-white disabled:opacity-40"
        onClick={onGenerate}
      >
        Generate course
      </button>
      <p className="mt-2 text-center text-[12px] text-[var(--ink-faint)]">Static preview. Generate opens the sample course.</p>
    </section>
  );
}

export function CardView({ card, onGenerate }: { card?: StudioCard; onGenerate?: () => void }) {
  if (!card) return null;
  if (card.type === 'summary') return <SummaryCard card={card} />;
  if (card.type === 'diff') return <DiffCard card={card} />;
  if (card.type === 'settings') return <SettingsCard card={card} />;
  if (card.type === 'source' && card.kind === 'playlist' && onGenerate) return <SourceCard onGenerate={onGenerate} />;
  if (card.type === 'source') {
    return (
      <section data-testid="source-card" className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-left text-[13px] text-[var(--ink-soft)]">
        {card.kind === 'video' ? 'One YouTube video. The playlist checklist is the sample with the full outline.' : null}
        {card.kind === 'web' ? 'Web pages are in the static preview. The built course is SAT Math Sprint.' : null}
        {card.kind === 'pdf' ? 'PDF import is in the static preview. The built course is SAT Math Sprint.' : null}
        {onGenerate ? (
          <button type="button" data-testid="source-generate" data-accent="primary" className="mt-3 h-11 w-full rounded-lg bg-[var(--accent)] text-[14px] font-semibold text-white" onClick={onGenerate}>
            Open sample course
          </button>
        ) : null}
      </section>
    );
  }
  return null;
}
