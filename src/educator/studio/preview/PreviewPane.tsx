import { useMemo, useState } from 'react';
import {
  CirclePlay,
  ClipboardList,
  FileText,
  Layers,
  ListChecks,
  NotebookPen,
  Plus,
  TextCursorInput,
  Trash2,
  X,
} from 'lucide-react';
import type { StudioCourse, StudioItem } from '../model';

const ICONS = {
  video: CirclePlay,
  reading: FileText,
  notes: NotebookPen,
  drill: ListChecks,
  cards: Layers,
  blanks: TextCursorInput,
  mock: ClipboardList,
} as const;

function kindIcon(kind: string) {
  return ICONS[kind as keyof typeof ICONS] ?? FileText;
}

function lessonLabel(course: StudioCourse, item: StudioItem) {
  const moduleIndex = course.modules.findIndex((module) => module.id === item.moduleId) + 1;
  const module = course.modules.find((entry) => entry.id === item.moduleId);
  if (item.kind === 'video' || item.kind === 'reading') {
    const lessonIndex = (module?.items.filter((entry) => entry.kind === 'video' || entry.kind === 'reading').findIndex((entry) => entry.id === item.id) ?? 0) + 1;
    return `Module ${moduleIndex} · ${module?.name} · Lesson ${moduleIndex}.${lessonIndex}`;
  }
  return `Module ${moduleIndex} · ${module?.name}`;
}

function BlankLine({ sentence }: { sentence: string }) {
  const parts = sentence.split(/\{([^}]+)\}/);
  return (
    <p className="text-[14px] leading-relaxed text-[var(--ink)]">
      {parts.map((part, index) => (index % 2 === 1 ? (
        <span key={index} className="mx-0.5 border-b border-[var(--ink)] font-semibold">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )))}
    </p>
  );
}

function ItemView({ course, item, onAdd, onFix }: { course: StudioCourse; item: StudioItem; onAdd: () => void; onFix: () => void }) {
  const content = item.content;
  return (
    <div data-testid="item-view" className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-[10px] text-[var(--ink-faint)]">{lessonLabel(course, item)}</p>
          <h2 data-testid="item-view-title" className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-[var(--ink)]">
            {item.fullTitle || item.title}
          </h2>
          {content.kind === 'video' ? (
            <p className="mt-1 text-[12px] text-[var(--ink-soft)]">YouTube · {content.duration} · embedded</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" data-testid="view-add" aria-label={`Add to chat: ${item.title}`} className="grid size-11 place-items-center rounded-lg border border-[var(--border)] text-[var(--ink-soft)] md:size-9" onClick={onAdd}>
            <Plus size={14} />
          </button>
          <button type="button" data-testid="item-fix" aria-label={`Fix with AI: ${item.title}`} className="inline-flex h-11 items-center gap-1 rounded-lg border border-[var(--border)] px-2 text-[12px] font-semibold text-[var(--ink)] md:h-9" onClick={onFix}>
            <Sparkle /> Fix with AI
          </button>
        </div>
      </div>
      {content.kind === 'video' ? (
        <>
          <div data-testid="view-video" className="mt-4 grid h-40 place-items-center rounded-xl bg-[var(--fill)] text-[var(--ink-faint)]">
            <span className="inline-flex items-center gap-2 text-[13px]"><CirclePlay size={18} /> {content.duration}</span>
          </div>
          <p className="text-label mt-5 text-[10px] text-[var(--ink-faint)]">AI notes</p>
          <ul data-testid="view-notes" className="mt-2">
            {(content.notes ?? []).map((note) => (
              <li key={note.at} data-testid="view-note" className="flex gap-3 border-b border-[var(--border)] py-2 text-[13px]">
                <span className="w-12 shrink-0 font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{note.at}</span>
                <span className="text-[var(--ink)]">{note.text}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {content.kind === 'notes' ? (
        <ul data-testid="view-notes" className="mt-4">
          {(content.points ?? []).map((note) => (
            <li key={`${note.lessonTitle}-${note.at}`} data-testid="view-note" className="border-b border-[var(--border)] py-2">
              <p className="text-[11px] text-[var(--ink-faint)]">{note.lessonTitle}</p>
              <p className="mt-1 text-[14px] text-[var(--ink)]"><span className="mr-2 font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{note.at}</span>{note.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {content.kind === 'drill' ? (
        <div className="mt-4">
          <ol className="space-y-3">
            {(content.questions ?? []).map((question) => (
              <li key={question.id} data-testid="view-question" data-n={question.n} className="text-[14px] text-[var(--ink)]">
                <span className="mr-2 font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">Q{question.n}</span>
                {question.prompt}
                <span className="mt-0.5 block text-[11px] text-[var(--ink-faint)]">{question.format}</span>
              </li>
            ))}
          </ol>
          {content.moreCount ? <p className="mt-3 text-[13px] text-[var(--ink-soft)]">{content.moreCount} more questions like these</p> : null}
        </div>
      ) : null}
      {content.kind === 'cards' ? (
        <ul className="mt-4 space-y-2">
          {(content.cards ?? []).map((card) => (
            <li key={card.front} data-testid="view-card" className="rounded-lg border border-[var(--border)] p-3">
              <p className="text-[14px] font-semibold text-[var(--ink)]">{card.front}</p>
              <p className="mt-1 text-[13px] text-[var(--ink-soft)]">{card.back}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {content.kind === 'blanks' ? (
        <ul className="mt-4 space-y-3">
          {(content.blanks ?? []).map((blank) => (
            <li key={blank.sentence} data-testid="view-blank">
              {blank.at ? <p className="mb-1 font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{blank.at}</p> : null}
              <BlankLine sentence={blank.sentence} />
            </li>
          ))}
        </ul>
      ) : null}
      {content.kind === 'mock' ? (
        <div className="mt-4">
          <p className="text-[13px] text-[var(--ink-soft)]">{content.totalQuestions} questions · {content.minutes} min{content.adaptive ? ' · adaptive' : ''}</p>
          <ul className="mt-3">
            {(content.sections ?? []).map((section) => (
              <li key={section.name} data-testid="view-mock-section" className="flex justify-between border-b border-[var(--border)] py-2 text-[14px] text-[var(--ink)]">
                <span>{section.name}</span>
                <span className="font-[family-name:var(--mono)] text-[12px] text-[var(--ink-faint)]">{section.questions} Qs · {section.minutes} min</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Sparkle() {
  return (
    <svg data-accent="symbol" width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]" aria-hidden="true">
      <path d="M12 3l1.2 4.2L17.5 8.5 13.2 9.7 12 14l-1.2-4.3L6.5 8.5l4.3-1.3L12 3z" fill="currentColor" />
      <path d="M18 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2z" fill="currentColor" />
    </svg>
  );
}

export function PreviewPane({
  course,
  onMention,
  onFix,
  onClose,
}: {
  course: StudioCourse;
  onMention: (item: StudioItem) => void;
  onFix: (item: StudioItem) => void;
  onClose?: () => void;
}) {
  const firstId = course.modules[0]?.items[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState(firstId);
  const [hidden, setHidden] = useState<string[]>([]);
  const [pressed, setPressed] = useState<string[]>([]);
  const visibleModules = useMemo(
    () => course.modules.map((module) => ({ ...module, items: module.items.filter((item) => !hidden.includes(item.id)) })).filter((module) => module.items.length > 0),
    [course.modules, hidden],
  );
  const selected = course.modules.flatMap((module) => module.items).find((item) => item.id === selectedId) ?? visibleModules[0]?.items[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <div>
          <p className="text-label text-[10px] text-[var(--ink-faint)]">Live preview · read-only</p>
          <p className="text-[12px] text-[var(--ink-soft)]">Tap + to mention it in the chat</p>
        </div>
        {onClose ? (
          <button type="button" data-testid="preview-close" aria-label="Close preview" className="preview-close grid size-11 place-items-center rounded-lg text-[var(--ink-soft)] md:hidden" onClick={onClose}>
            <X size={16} />
          </button>
        ) : null}
      </header>
      <div className="preview-split">
        <div data-testid="outline" className="preview-scroll border-r border-[var(--border)]">
          <div className="px-4 py-3">
            <p className="text-[14px] font-semibold text-[var(--ink)]">{course.title}</p>
            <p className="mt-0.5 font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">
              mycubit.app/c/{course.slug} · {course.visibility === 'public' ? 'Public link' : 'Private'}
            </p>
          </div>
          {visibleModules.map((module, index) => (
            <section key={module.id} data-testid="outline-module" data-module-id={module.id} className="pb-2">
              <div data-testid="module-header" className="flex items-center justify-between gap-2 px-4 py-2">
                <div className="min-w-0">
                  <p className="font-[family-name:var(--mono)] text-[10px] uppercase tracking-[0.04em] text-[var(--ink-faint)]">
                    Module {index + 1} · {module.items.length} items
                  </p>
                  <p className="truncate text-[13px] font-semibold text-[var(--ink)]">{module.name}</p>
                </div>
                <button type="button" data-testid="module-fix" data-accent="symbol" aria-label={`Fix with AI: module ${module.name}`} className="grid size-11 place-items-center text-[var(--accent)] md:size-8" onClick={() => onFix(module.items[0])}>
                  <Sparkle />
                </button>
              </div>
              {module.items.map((item) => {
                const Icon = kindIcon(item.kind);
                const current = item.id === selected?.id;
                return (
                  <div key={item.id} data-testid="outline-row" data-item-id={item.id} className={`flex items-center gap-1 pr-2 ${current ? 'bg-[var(--fill)]' : ''}`}>
                    <button
                      type="button"
                      data-testid="outline-item"
                      data-kind={item.kind}
                      aria-current={current ? 'true' : undefined}
                      className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2 text-left"
                      onClick={() => setSelectedId(item.id)}
                    >
                      <Icon size={14} className="shrink-0 text-[var(--ink-faint)]" />
                      <span className="truncate text-[13px] text-[var(--ink)]">{item.title}</span>
                    </button>
                    <button
                      type="button"
                      data-testid="row-add"
                      aria-pressed={pressed.includes(item.id)}
                      aria-label={`Add to chat: ${item.title}`}
                      className="grid size-11 place-items-center text-[var(--ink-soft)] md:size-8"
                      onClick={() => {
                        setPressed((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]));
                        onMention(item);
                      }}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      data-testid="row-delete"
                      aria-label={`Delete ${item.title}`}
                      className="grid size-11 place-items-center text-[var(--ink-faint)] md:size-8"
                      onClick={() => setHidden((current) => [...current, item.id])}
                    >
                      <Trash2 size={13} />
                    </button>
                    <span data-testid="row-meta" className="w-14 shrink-0 text-right font-[family-name:var(--mono)] text-[11px] text-[var(--ink-faint)]">{item.meta}</span>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
        <div className="preview-scroll">
          {selected ? <ItemView course={course} item={selected} onAdd={() => onMention(selected)} onFix={() => onFix(selected)} /> : (
            <p className="p-5 text-[13px] text-[var(--ink-soft)]">Nothing left in this preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
