import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Settings, Sparkles, Upload } from 'lucide-react';
import type { DiffOp, ItemRef, StudioChatMessage } from '../model';
import { CardView } from './cards';

type ChatPaneProps = {
  messages: StudioChatMessage[];
  refs?: ItemRef[];
  onRemoveRef?: (id: string) => void;
  onSend: (text: string) => void;
  onGenerate?: (draft: { title: string; description: string }) => void;
  onResolve?: (id: string, status: DiffOp['status']) => void;
  busy?: boolean;
  placeholder: string;
  showQuick?: boolean;
};

export function ChatPane({ messages, refs = [], onRemoveRef, onSend, onGenerate, onResolve, busy = false, placeholder, showQuick = false }: ChatPaneProps) {
  const [text, setText] = useState('');
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    if (!pinned.current) return;
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const send = () => {
    const next = text.trim();
    if (!next) return;
    setText('');
    onSend(next);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scroller}
        data-testid="chat-scroll"
        className="chat-scroll px-4 py-4"
        onScroll={(event) => {
          const node = event.currentTarget;
          pinned.current = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
        }}
      >
        <div data-testid="chat-thread" className="space-y-4">
          {messages.map((message) => (
            <article key={message.id} data-testid={message.role === 'user' ? 'msg-user' : 'msg-ai'} className={message.role === 'user' ? 'flex justify-end' : ''}>
              {message.role === 'ai' ? <p className="text-label text-[10px] text-[var(--ink-faint)]">Cubit AI</p> : null}
              {message.refs && message.refs.length > 0 ? (
                <div className="mb-1 flex flex-wrap justify-end gap-1">
                  {message.refs.map((ref) => (
                    <span key={ref.id} data-accent="chip" className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                      @{ref.label}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className={message.role === 'user' ? 'max-w-[90%] rounded-2xl bg-[var(--fill)] px-3 py-2 text-[14px] leading-relaxed text-[var(--ink)]' : 'mt-1 text-[14px] leading-relaxed text-[var(--ink)]'} aria-live={message.role === 'ai' ? 'polite' : undefined}>
                {message.text}
              </p>
              {message.pending ? (
                <div data-testid="studio-status" className="studio-status" aria-hidden="true">
                  <span data-accent="progress" className="studio-status-bar" />
                </div>
              ) : null}
              <CardView card={message.card} busy={busy} onGenerate={onGenerate} onResolve={onResolve} />
            </article>
          ))}
        </div>
      </div>
      <form
        data-testid="composer"
        className="shrink-0 border-t border-[var(--border)] px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        {refs.length > 0 ? (
          <div data-testid="ref-chips" className="mb-2 flex flex-wrap gap-1">
            {refs.map((ref) => (
              <button key={ref.id} type="button" data-accent="chip" className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)]" onClick={() => onRemoveRef?.(ref.id)}>
                @{ref.label} ×
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex items-end gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-4 pr-1">
          <textarea
            data-testid="composer-input"
            rows={1}
            value={text}
            placeholder={placeholder}
            className="composer-input max-h-40 min-h-9 flex-1 bg-transparent py-2 text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                send();
              }
            }}
          />
          <button type="submit" data-testid="composer-send" data-accent="primary" aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white">
            <ArrowUp size={16} />
          </button>
        </div>
        {showQuick ? (
          <div data-testid="quick-chips" className="mt-2 flex flex-wrap gap-2">
            <button type="button" data-testid="fix-with-ai" className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-[12px] text-[var(--ink)] md:h-8" onClick={() => onSend('Fix with AI')}>
              <Sparkles size={13} className="text-[var(--accent)]" data-accent="symbol" /> Fix with AI
            </button>
            <button type="button" className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-[12px] text-[var(--ink)] md:h-8" onClick={() => onSend('Open course settings')}>
              <Settings size={13} /> Settings
            </button>
            <button type="button" className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--border)] px-3 text-[12px] text-[var(--ink)] md:h-8" onClick={() => onSend('Publish the course')}>
              <Upload size={13} /> Publish
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
