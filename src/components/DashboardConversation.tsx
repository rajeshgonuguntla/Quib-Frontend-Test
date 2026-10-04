import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { SquarePen } from 'lucide-react';
import { stripAnswerMarkup } from './dashboardAnswer';

export type DashTurn = {
  id: string;
  question: string;
  answer: string;
};

function CubeMark() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
  );
}

function renderBold(line: string): ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function RichAnswer({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n/);
  return (
    <div className="text-[14.5px] leading-[1.74] text-[var(--ink)]">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index === paragraphs.length - 1 ? undefined : 'mb-3.5'}>
          {paragraph.split('\n').map((line, lineIndex) => (
            <span key={lineIndex}>
              {lineIndex > 0 ? <br /> : null}
              {renderBold(line)}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function AssistantAnswer({
  text,
  onGrow,
  onDone,
}: {
  text: string;
  onGrow: () => void;
  onDone: () => void;
}) {
  const reducedRef = useRef(false);
  const finishedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onGrowRef = useRef(onGrow);
  const onDoneRef = useRef(onDone);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(0);
  const done = started && visible >= text.length;

  useEffect(() => {
    onGrowRef.current = onGrow;
    onDoneRef.current = onDone;
  }, [onGrow, onDone]);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      setStarted(true);
      if (reducedRef.current) setVisible(text.length);
    }, reducedRef.current ? 0 : 480);
    return () => window.clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if (!started || reducedRef.current) return;
    timerRef.current = window.setInterval(() => {
      setVisible((current) => Math.min(text.length, current + 4));
    }, 16);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [started, text]);

  useEffect(() => {
    if (visible < text.length || !timerRef.current) return;
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, [visible, text.length]);

  useLayoutEffect(() => {
    if (!started) return;
    onGrowRef.current();
    if (visible < text.length || finishedRef.current) return;
    finishedRef.current = true;
    onDoneRef.current();
  }, [started, visible, text.length]);

  if (!started) {
    return (
      <div className="flex items-center gap-[5px] py-1.5" role="status" aria-label="Writing a reply">
        <span className="dash-dot size-1.5 rounded-full bg-[var(--ink-faint)]" />
        <span className="dash-dot size-1.5 rounded-full bg-[var(--ink-faint)]" />
        <span className="dash-dot size-1.5 rounded-full bg-[var(--ink-faint)]" />
      </div>
    );
  }

  if (!done) {
    return (
      <p className="text-[14.5px] leading-[1.74] text-[var(--ink)]" aria-hidden>
        {stripAnswerMarkup(text).slice(0, visible)}
        <span className="dash-caret" />
      </p>
    );
  }

  return <RichAnswer text={text} />;
}

export function DashboardThread({
  turns,
  onNewConversation,
  onAnswer,
}: {
  turns: DashTurn[];
  onNewConversation: () => void;
  onAnswer: (announcement: string) => void;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  const stickToBottom = () => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useLayoutEffect(() => {
    stickToBottom();
  }, [turns]);

  useEffect(() => {
    const scroller = threadRef.current;
    const content = scroller?.firstElementChild;
    if (!scroller || !content) return;
    const observer = new ResizeObserver(() => {
      scroller.scrollTop = scroller.scrollHeight;
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [turns.length]);

  return (
    <div className="dash-thread-in flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p
          className="uppercase text-[var(--ink-faint)]"
          style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.05em' }}
        >
          Conversation
        </p>
        <button
          type="button"
          onClick={onNewConversation}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[12px] font-semibold text-[var(--ink-soft)] transition-colors hover:border-[var(--ink-faint)] hover:text-[var(--ink)]"
        >
          <SquarePen size={13} strokeWidth={2} />
          New conversation
        </button>
      </div>
      <div
        ref={threadRef}
        className="dash-thread min-h-0 flex-1 overflow-y-auto pr-1"
        role="region"
        aria-label="Conversation"
      >
        <div className="flex flex-col gap-8 pb-6">
          {turns.map((turn) => (
            <article key={turn.id} className="flex flex-col gap-[18px]">
              <div className="flex justify-end">
                <div className="max-w-[min(72%,520px)] rounded-[18px] rounded-br-[4px] border border-[var(--border)] bg-[var(--fill)] px-4 py-[11px] text-[14px] font-medium leading-normal text-[var(--ink)] [overflow-wrap:anywhere]">
                  {turn.question}
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-[var(--ink)] text-[var(--bg)]">
                  <CubeMark />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <AssistantAnswer
                    text={turn.answer}
                    onGrow={stickToBottom}
                    onDone={() => onAnswer(`${turn.question}. ${stripAnswerMarkup(turn.answer)}`)}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Move the ask bar between its resting spot and the dock without remounting it. */
export function useDockFlip(chatting: boolean, chatLocked: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const pendingFrom = useRef<DOMRect | null>(null);

  const capture = () => {
    const el = ref.current;
    if (!el) return;
    pendingFrom.current = el.getBoundingClientRect();
  };

  useLayoutEffect(() => {
    if (chatting !== chatLocked) return;
    const el = ref.current;
    const from = pendingFrom.current;
    if (!el || !from) return;
    pendingFrom.current = null;

    const to = el.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    if (Math.hypot(dx, dy) < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.style.transition = 'none';
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        el.style.transition = 'transform 560ms cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });

    const clear = (event: TransitionEvent) => {
      if (event.propertyName !== 'transform') return;
      el.style.transition = '';
      el.style.transform = '';
    };
    el.addEventListener('transitionend', clear);

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      el.removeEventListener('transitionend', clear);
      el.style.transition = '';
      el.style.transform = '';
    };
  }, [chatting, chatLocked]);

  return { composerRef: ref, capture };
}
