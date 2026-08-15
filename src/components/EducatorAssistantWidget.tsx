import { useEffect, useRef, useState } from 'react';
import { Check, ChevronsRight, Loader2, Send, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import {
  sendEducatorAssistantMessage,
  type AssistantEditSource,
} from '../api/educatorAssistantApi';
import type { CourseEditOperation, CourseUpdatePayload } from '../types/courseGeneration';
import { useTheme, getC } from './ThemeContext';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  source?: AssistantEditSource;
  pendingChange?: AssistantApplyResult;
  changeStatus?: 'pending' | 'approved' | 'previewed';
}

export type AssistantApplyResult = {
  courseUpdate: CourseUpdatePayload | null;
  operations?: CourseEditOperation[] | null;
  source?: AssistantEditSource;
};

interface EducatorAssistantWidgetProps {
  courseId: string;
  courseTitle: string;
  sessionKey: string;
  onApplyCourseUpdate?: (update: CourseUpdatePayload) => void;
  onApplyAssistantResult?: (result: AssistantApplyResult) => void;
  /** Persist approved changes to the backend (no manual Save click). */
  onApproveAndSave?: (result: AssistantApplyResult) => Promise<void>;
  /** Preview in editor without saving. */
  onPreviewChange?: (result: AssistantApplyResult) => void;
  /** `panel` = docked full-height column; `floating` = slide-in dock + FAB. */
  variant?: 'floating' | 'panel';
  onCollapse?: () => void;
}

type LoadingPhase = 'idle' | 'routing' | 'local' | 'ai' | 'applying';

function getError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (err.response?.status === 429) {
      return 'Too many requests. Please wait and try again.';
    }
    return data?.message || err.message || 'Assistant unavailable.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Assistant unavailable.';
}

function phaseLabel(phase: LoadingPhase): string {
  switch (phase) {
    case 'routing':
    case 'local':
    case 'ai':
    case 'applying':
      return 'Working on your changes…';
    default:
      return 'Working on it…';
  }
}

export function EducatorAssistantWidget({
  courseId,
  courseTitle,
  sessionKey,
  onApplyCourseUpdate,
  onApplyAssistantResult,
  onApproveAndSave,
  onPreviewChange,
  variant = 'floating',
  onCollapse,
}: EducatorAssistantWidgetProps) {
  const isPanel = variant === 'panel';
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('idle');
  const [approvingIndex, setApprovingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const courseRevisionRef = useRef<string | undefined>(undefined);

  const canApprove = Boolean(onApproveAndSave);
  const canPreview = Boolean(onPreviewChange || onApplyAssistantResult || onApplyCourseUpdate);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setError(null);
    if (!isPanel) setOpen(false);
    setApprovingIndex(null);
    sessionIdRef.current = crypto.randomUUID();
    courseRevisionRef.current = undefined;
  }, [courseId, sessionKey, isPanel]);

  useEffect(() => {
    if ((open || isPanel) && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, isPanel, messages, loading, loadingPhase, approvingIndex]);

  const previewChange = (result: AssistantApplyResult) => {
    if (onPreviewChange) {
      onPreviewChange(result);
    } else if (onApplyAssistantResult) {
      onApplyAssistantResult(result);
    } else if (result.courseUpdate && onApplyCourseUpdate) {
      onApplyCourseUpdate(result.courseUpdate);
    }
  };

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setLoadingPhase('routing');
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 120));
      setLoadingPhase('ai');

      const res = await sendEducatorAssistantMessage(courseId, {
        message: text,
        sessionId: sessionIdRef.current,
        courseRevision: courseRevisionRef.current,
      });

      if (res.sessionId) {
        sessionIdRef.current = res.sessionId;
      }
      if (res.courseRevision) {
        courseRevisionRef.current = res.courseRevision;
      }

      setLoadingPhase(res.source === 'local' ? 'local' : 'applying');

      const hasChanges = res.hasCourseChanges && (res.courseUpdate || res.operations?.length);
      const pendingChange: AssistantApplyResult | undefined = hasChanges
        ? {
            courseUpdate: res.courseUpdate,
            operations: res.operations,
            source: res.source,
          }
        : undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          source: res.source,
          pendingChange,
          changeStatus: pendingChange ? 'pending' : undefined,
        },
      ]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getError(err));
    } finally {
      setLoading(false);
      setLoadingPhase('idle');
    }
  };

  const handleApprove = async (index: number) => {
    const msg = messages[index];
    if (!msg?.pendingChange || !onApproveAndSave || msg.changeStatus === 'approved') return;

    setApprovingIndex(index);
    setError(null);
    try {
      await onApproveAndSave(msg.pendingChange);
      setMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, changeStatus: 'approved' as const } : m)),
      );
    } catch (err) {
      setError(getError(err));
    } finally {
      setApprovingIndex(null);
    }
  };

  const handlePreview = (index: number) => {
    const msg = messages[index];
    if (!msg?.pendingChange || !canPreview) return;
    previewChange(msg.pendingChange);
    setMessages((prev) =>
      prev.map((m, i) => (i === index ? { ...m, changeStatus: 'previewed' as const } : m)),
    );
  };

  const panelBg = isDark ? C.bg : C.bg;
  const suggestions = isPanel
    ? [
        'Rename module 1 to Getting Started',
        'Move the last lesson to the top of module 1',
        'Add a clearer summary to lesson 1',
      ]
    : [
        'Set a clearer course title',
        'Reorder modules for a better flow',
        'Shorten the course description',
      ];

  const chatPanel = (
    <div
      className={
        isPanel
          ? 'flex h-full min-h-0 w-full flex-col overflow-hidden'
          : 'flex h-full min-h-0 w-full flex-col overflow-hidden'
      }
      style={{
        background: panelBg,
        borderLeft: isPanel ? undefined : `1px solid ${C.border}`,
      }}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-3 px-4 py-3.5"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.bg1 }}
      >
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[0.88rem] font-[600] truncate flex items-center gap-2" style={{ color: C.text }}>
            <span
              className="inline-flex size-7 items-center justify-center rounded-lg shrink-0"
              style={{ background: C.redDim, color: C.red }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            Course assistant
          </p>
          <p className="mt-1 text-[0.7rem] truncate pl-9" style={{ color: C.text3 }}>
            {courseTitle}
          </p>
        </div>
        {(isPanel && onCollapse) || !isPanel ? (
          <button
            type="button"
            onClick={() => (isPanel ? onCollapse?.() : setOpen(false))}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shrink-0"
            style={{ background: C.red, color: '#fff', border: 'none' }}
            aria-label={isPanel ? 'Collapse assistant' : 'Close assistant'}
            title={isPanel ? 'Collapse assistant' : 'Close'}
          >
            {isPanel ? <ChevronsRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 space-y-3"
        style={{ background: C.bg }}
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <div
              className="rounded-2xl px-4 py-4 text-[0.82rem] leading-relaxed"
              style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text2 }}
            >
              <p className="font-[600] mb-1.5" style={{ color: C.text }}>
                Edit this course with plain language
              </p>
              <p>
                Ask for renames, reorders, or wording tweaks.
                Use <strong style={{ color: C.text }}>Approve &amp; save</strong> when a change is proposed
                {canPreview ? ', or Preview first.' : '.'}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[0.68rem] uppercase tracking-wider" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
                Try one
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      void sendMessage(s);
                    }}
                    className="rounded-xl px-3.5 py-2.5 text-left text-[0.78rem] leading-snug cursor-pointer transition-colors disabled:opacity-50"
                    style={{
                      background: C.bg1,
                      border: `1px solid ${C.border}`,
                      color: C.text2,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.red;
                      e.currentTarget.style.color = C.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.color = C.text2;
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[92%]">
              <div
                className="rounded-2xl px-3.5 py-2.5 text-[0.82rem] leading-relaxed whitespace-pre-wrap"
                style={{
                  background: msg.role === 'user' ? C.red : C.bg1,
                  color: msg.role === 'user' ? '#fff' : C.text,
                  border: msg.role === 'user' ? 'none' : `1px solid ${C.border}`,
                }}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' && msg.pendingChange && msg.changeStatus === 'pending' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {canApprove && (
                    <button
                      type="button"
                      disabled={approvingIndex === idx || loading}
                      onClick={() => void handleApprove(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] font-medium cursor-pointer disabled:opacity-50"
                      style={{ background: C.red, color: '#fff', border: 'none' }}
                    >
                      {approvingIndex === idx ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      Approve &amp; save
                    </button>
                  )}
                  {canPreview && (
                    <button
                      type="button"
                      disabled={approvingIndex === idx || loading}
                      onClick={() => handlePreview(idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.75rem] font-medium cursor-pointer disabled:opacity-50"
                      style={{
                        background: C.bg2,
                        color: C.text,
                        border: `1px solid ${C.border}`,
                      }}
                    >
                      {isPanel ? 'Preview only' : 'Preview in editor'}
                    </button>
                  )}
                </div>
              )}
              {msg.role === 'assistant' && msg.changeStatus === 'approved' && (
                <p className="mt-1.5 text-[0.7rem] font-medium" style={{ color: '#16a34a' }}>
                  Saved to course
                </p>
              )}
              {msg.role === 'assistant' && msg.changeStatus === 'previewed' && (
                <p className="mt-1.5 text-[0.7rem]" style={{ color: C.text3 }}>
                  Preview applied — approve to save{isPanel ? '' : ' or use Save in editor'}
                </p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col gap-1 text-[0.78rem]" style={{ color: C.text3 }}>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {phaseLabel(loadingPhase)}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="shrink-0 px-4 pb-2 text-[0.75rem]" style={{ color: C.red }}>
          {error}
        </p>
      )}

      <div
        className="flex shrink-0 items-end gap-2 px-3 py-3"
        style={{ borderTop: `1px solid ${C.border}`, background: C.bg1 }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void sendMessage();
            }
          }}
          rows={2}
          placeholder="Ask to rename, reorder, or rewrite…"
          className="flex-1 resize-none rounded-xl px-3 py-2.5 text-[0.82rem] outline-none"
          style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            color: C.text,
          }}
        />
        <button
          type="button"
          onClick={() => void sendMessage()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
          style={{ background: C.red, color: '#fff', border: 'none' }}
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (isPanel) {
    return chatPanel;
  }

  // Full-height right dock (opens from FAB)
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[199] bg-black/40 lg:bg-transparent"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className="fixed z-[200] flex flex-col transition-transform duration-300 ease-out"
        style={{
          top: 56,
          right: 0,
          bottom: 0,
          width: 'min(400px, 100vw)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: open ? 'auto' : 'none',
          boxShadow: open ? (isDark ? '-12px 0 40px rgba(0,0,0,0.45)' : '-12px 0 40px rgba(0,0,0,0.12)') : 'none',
          borderLeft: `1px solid ${C.border}`,
          background: C.bg,
        }}
        aria-hidden={!open}
      >
        {chatPanel}
      </aside>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
          style={{
            background: C.red,
            color: '#fff',
            border: 'none',
            boxShadow: '0 8px 32px rgba(225,6,0,0.35)',
          }}
          aria-label="Open course assistant"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[0.82rem] font-[600] hidden sm:inline">AI assistant</span>
        </button>
      )}
    </>
  );
}
