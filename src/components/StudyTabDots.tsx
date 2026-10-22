import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';

export type StudyTabId = 'overview' | 'notes' | 'flashcards' | 'blanks' | 'exam';

export type StudyTabOption = { id: StudyTabId; label: string };

type Props = {
  tabs: readonly StudyTabOption[];
  value: StudyTabId;
  onChange: (id: StudyTabId) => void;
  accent: string;
  faint: string;
  ink: string;
  bg: string;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function studyIndexFromY(
  clientY: number,
  top: number,
  height: number,
  count: number,
): number {
  if (count <= 1 || height <= 0) return 0;
  return Math.round(clamp(((clientY - top) / height) * (count - 1), 0, count - 1));
}

export function StudyTabDots({ tabs, value, onChange, accent, faint, ink, bg }: Props) {
  const clusterRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<number | null>(null);
  const index = Math.max(0, tabs.findIndex((t) => t.id === value));
  const shown = draft ?? index;
  const last = Math.max(0, tabs.length - 1);

  const fromY = (clientY: number) => {
    const rect = clusterRef.current?.getBoundingClientRect();
    if (!rect) return index;
    return studyIndexFromY(clientY, rect.top, rect.height, tabs.length);
  };

  const commit = (next: number) => {
    const tab = tabs[next];
    if (tab) onChange(tab.id);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const next = fromY(e.clientY);
    setDraft(next);
    commit(next);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (draft == null) return;
    const next = fromY(e.clientY);
    setDraft(next);
    if (tabs[next]?.id !== value) commit(next);
  };

  const onPointerUp = () => {
    if (draft == null) return;
    commit(draft);
    setDraft(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      commit(clamp(index + 1, 0, last));
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      commit(clamp(index - 1, 0, last));
    }
  };

  return (
    <div
      className="fixed left-0 top-1/2 z-40 flex w-12 -translate-y-1/2 flex-col items-center touch-none md:hidden"
      role="slider"
      tabIndex={0}
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={shown}
      aria-valuetext={tabs[shown]?.label}
      aria-label="Study tools"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <div ref={clusterRef} className="relative flex flex-col items-center gap-2 py-2">
        {tabs.map((tab, i) => (
          <span
            key={tab.id}
            className="pointer-events-none rounded-full"
            style={{
              width: 12,
              height: 12,
              background: i === shown ? accent : 'transparent',
              border: `1.5px solid ${i === shown ? accent : faint}`,
            }}
          />
        ))}
        {draft != null && tabs[shown] && (
          <span
            className="pointer-events-none absolute left-5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold"
            style={{
              top: shown * 20,
              background: ink,
              color: bg,
            }}
          >
            {tabs[shown].label}
          </span>
        )}
      </div>
    </div>
  );
}
