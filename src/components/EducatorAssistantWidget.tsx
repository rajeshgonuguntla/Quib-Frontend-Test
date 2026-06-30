import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Send, Sparkles, X } from 'lucide-react';
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
  /** `panel` = docked left column in course editor; `floating` = FAB overlay (course details). */
  variant?: 'floating' | 'panel';
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
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, loading, loadingPhase, approvingIndex]);

  const previewChange = (result: AssistantApplyResult) => {
    if (onPreviewChange) {
      onPreviewChange(result);
    } else if (onApplyAssistantResult) {
      onApplyAssistantResult(result);
    } else if (result.courseUpdate && onApplyCourseUpdate) {
      onApplyCourseUpdate(result.courseUpdate);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
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

  const panelBg = isDark ? 'rgba(12,12,16,0.98)' : 'rgba(255,255,255,0.98)';

  const chatPanel = (
    <div
      className={
        isPanel
          ? 'flex h-full min-h-0 flex-col overflow-hidden bg-background'
          : 'flex flex-col overflow-hidden rounded-2xl shadow-2xl'
      }
      style={
        isPanel
          ? undefined
          : {
              width: 'min(400px, calc(100vw - 2rem))',
              height: 'min(540px, calc(100vh - 8rem))',
              background: panelBg,
              border: `1px solid ${C.border}`,
              backdropFilter: 'blur(20px)',
            }
      }
    >
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.bg1 }}
      >
        <div className="min-w-0">
          <p className="text-[0.85rem] font-[600] truncate flex items-center gap-1.5" style={{ color: C.text }}>
            <Sparkles className="w-4 h-4" style={{ color: C.red }} />
            {isPanel ? 'Course editor assistant' : 'Course assistant'}
          </p>
          <p className="text-[0.7rem] truncate" style={{ color: C.text3 }}>
            {courseTitle}
          </p>
        </div>
        {!isPanel && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ background: C.bg }}
      >
        {messages.length === 0 && (
          <div
            className="rounded-xl px-4 py-3 text-[0.8rem] leading-relaxed"
            style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text2 }}
          >
            {isPanel ? (
              <>
                Describe changes to your course on the left — modules stay visible on the right.
                Use <strong>Approve &amp; save</strong> to persist without leaving this screen.
              </>
            ) : (
              <>
                Simple edits (rename, reorder) run instantly. When the assistant proposes changes,
                use <strong>Approve &amp; save</strong> to persist them.
                {canPreview ? ' Use Preview if you want to review in the editor first.' : null}
              </>
            )}
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
                  {canPreview && !isPanel && (
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
                      Preview in editor
                    </button>
                  )}
                  {canPreview && isPanel && (
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
                      Preview only
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
          placeholder={
            isPanel
              ? 'Describe changes to this course…'
              : 'e.g. Set title to Intro to React · move module 2 to top…'
          }
          className="flex-1 resize-none rounded-xl px-3 py-2 text-[0.82rem] outline-none"
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

  return (
    <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end gap-3 md:bottom-6">
      {open && chatPanel}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
        style={{
          background: isDark ? '#1a1a22' : '#fff',
          color: C.text,
          border: `1px solid ${C.border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
        aria-label={open ? 'Close course assistant' : 'Open course assistant'}
      >
        <Sparkles className="w-5 h-5" style={{ color: C.red }} />
        <span className="text-[0.82rem] font-[600] hidden sm:inline">
          {open ? 'Close assistant' : 'AI assistant'}
        </span>
      </button>
    </div>
  );
}
