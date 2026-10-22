import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { CheckCircle, ChevronDown, CircleHelp, FileText, PlayCircle } from 'lucide-react';
import { withoutLessonNumberPrefix } from '../utils/lessonTitle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export type KickerLesson = {
  id: string;
  title: string;
  duration?: string;
  type?: 'video' | 'reading';
};

export type KickerModule = {
  id: string;
  title: string;
  lessons: KickerLesson[];
  quiz?: unknown[];
};

type Props = {
  modules: readonly KickerModule[];
  activeModuleId: string;
  activeLessonId: string;
  completedLessons: Set<string>;
  passedModules: Set<string>;
  onSelectModule: (id: string) => void;
  onOpenLesson: (id: string) => void;
  onOpenQuiz: (moduleId: string) => void;
  accent: string;
  faint: string;
  ink: string;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/** Snap a horizontal drag to a module index. Swipe left advances. */
export function moduleIndexFromX(
  clientX: number,
  startX: number,
  startIndex: number,
  paneWidth: number,
  count: number,
): number {
  const last = Math.max(0, count - 1);
  if (count <= 1 || paneWidth <= 0) return clamp(startIndex, 0, last);
  const ratio = (startX - clientX) / paneWidth;
  const threshold = 0.28;
  const step =
    Math.abs(ratio) < threshold
      ? 0
      : Math.sign(ratio) * Math.max(1, Math.round(Math.abs(ratio)));
  return clamp(startIndex + step, 0, last);
}

function kickerLabel(index: number, title: string) {
  return `# MODULE ${index + 1} · ${title}`.toUpperCase();
}

export function ModuleKickerNav({
  modules,
  activeModuleId,
  activeLessonId,
  completedLessons,
  passedModules,
  onSelectModule,
  onOpenLesson,
  onOpenQuiz,
  accent,
  faint,
  ink,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, index: 0 });
  const draggingRef = useRef(false);
  const [paneW, setPaneW] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const committed = Math.max(
    0,
    modules.findIndex((m) => m.id === activeModuleId),
  );
  const [visualIndex, setVisualIndex] = useState(committed);
  const last = Math.max(0, modules.length - 1);
  const shown = visualIndex;
  const active = modules[committed] ?? modules[0];

  useEffect(() => {
    draggingRef.current = false;
    setVisualIndex(committed);
    setDragX(0);
    setDragging(false);
  }, [committed]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const sync = () => setPaneW(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (modules.length === 0) return null;

  const commitIndex = (next: number) => {
    const mod = modules[next];
    draggingRef.current = false;
    setVisualIndex(next);
    setDragX(0);
    setDragging(false);
    if (mod && mod.id !== activeModuleId) onSelectModule(mod.id);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* synthetic events in tests may not support capture */
    }
    draggingRef.current = true;
    startRef.current = { x: e.clientX, index: committed };
    setVisualIndex(committed);
    setDragX(0);
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setDragX(e.clientX - startRef.current.x);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const width = paneW || viewportRef.current?.clientWidth || 0;
    commitIndex(
      moduleIndexFromX(e.clientX, startRef.current.x, startRef.current.index, width, modules.length),
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      commitIndex(clamp(committed + 1, 0, last));
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      commitIndex(clamp(committed - 1, 0, last));
    }
  };

  const x = -visualIndex * paneW + dragX;

  return (
    <div className="mb-4 md:hidden">
      <div className="flex items-start">
        <div
          ref={viewportRef}
          className="min-w-0 flex-1 overflow-hidden touch-none"
          role="slider"
          tabIndex={0}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={shown}
          aria-valuetext={kickerLabel(shown, modules[shown]?.title ?? '')}
          aria-label="Modules"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <div
            className={`module-kicker-track flex ${dragging ? 'is-dragging' : ''}`}
            style={{ transform: paneW ? `translateX(${x}px)` : undefined }}
          >
            {modules.map((mod, i) => {
              const text = kickerLabel(i, mod.title);
              const hashEnd = text.indexOf(' ');
              return (
                <p
                  key={mod.id}
                  className="m-0 shrink-0 py-1 pr-2 text-[0.66rem] font-[500] leading-[1.45] tracking-wide uppercase select-none"
                  style={{
                    flex: paneW ? `0 0 ${paneW}px` : '0 0 100%',
                    color: i === shown ? ink : faint,
                    fontFamily: 'var(--mono)',
                  }}
                >
                  <span style={{ color: accent, fontWeight: 700 }}>{text.slice(0, hashEnd)}</span>
                  {text.slice(hashEnd)}
                </p>
              );
            })}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center"
              style={{ background: 'transparent', border: 'none', color: faint }}
              aria-label="Lessons in this module"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {(active?.lessons ?? []).map((lesson, i) => {
              const isActive = activeLessonId === lesson.id;
              const isDone = completedLessons.has(lesson.id);
              return (
                <DropdownMenuItem
                  key={lesson.id}
                  className="gap-2 py-2.5"
                  onSelect={() => onOpenLesson(lesson.id)}
                >
                  {isDone ? (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: '#22c55e' }} />
                  ) : lesson.type === 'video' ? (
                    <PlayCircle
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: isActive ? accent : faint }}
                    />
                  ) : (
                    <FileText
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: isActive ? accent : faint }}
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[0.78rem] font-[500]">
                    {withoutLessonNumberPrefix(lesson.title) || lesson.title}
                  </span>
                  <span className="shrink-0 text-[0.65rem]" style={{ color: faint }}>
                    {lesson.duration || `#${i + 1}`}
                  </span>
                </DropdownMenuItem>
              );
            })}
            {(active?.quiz?.length ?? 0) > 0 && active && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 py-2.5" onSelect={() => onOpenQuiz(active.id)}>
                  {passedModules.has(active.id) ? (
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: '#22c55e' }} />
                  ) : (
                    <CircleHelp className="h-3.5 w-3.5 shrink-0" style={{ color: faint }} />
                  )}
                  <span className="text-[0.78rem] font-[500]">Module quiz</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {modules.length > 1 && (
        <div className="mt-1 flex gap-[5px]" aria-hidden="true">
          {modules.map((mod, i) => (
            <span
              key={mod.id}
              className="block h-0.5 rounded-full"
              style={{
                width: i === shown ? 14 : 8,
                background: i === shown ? accent : faint,
                opacity: i === shown ? 1 : 0.45,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
