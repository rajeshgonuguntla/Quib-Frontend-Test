import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import { sendEducatorAssistantMessage } from '../api/educatorAssistantApi';
import type { CourseUpdatePayload } from '../types/courseGeneration';
import { useTheme, getC } from './ThemeContext';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface EducatorAssistantWidgetProps {
  courseId: string;
  courseTitle: string;
  sessionKey: string;
  onApplyCourseUpdate?: (update: CourseUpdatePayload) => void;
}

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

export function EducatorAssistantWidget({
  courseId,
  courseTitle,
  sessionKey,
  onApplyCourseUpdate,
}: EducatorAssistantWidgetProps) {
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setInput('');
    setError(null);
    setOpen(false);
  }, [courseId, sessionKey]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await sendEducatorAssistantMessage(courseId, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.hasCourseChanges && res.courseUpdate && onApplyCourseUpdate) {
        onApplyCourseUpdate(res.courseUpdate);
      }
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const panelBg = isDark ? 'rgba(12,12,16,0.98)' : 'rgba(255,255,255,0.98)';

  return (
    <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-end gap-3 md:bottom-6">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-2xl shadow-2xl"
          style={{
            width: 'min(400px, calc(100vw - 2rem))',
            height: 'min(540px, calc(100vh - 8rem))',
            background: panelBg,
            border: `1px solid ${C.border}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${C.border}`, background: C.bg1 }}
          >
            <div className="min-w-0">
              <p className="text-[0.85rem] font-[600] truncate flex items-center gap-1.5" style={{ color: C.text }}>
                <Sparkles className="w-4 h-4" style={{ color: C.red }} />
                Course assistant
              </p>
              <p className="text-[0.7rem] truncate" style={{ color: C.text3 }}>
                {courseTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: C.bg }}
          >
            {messages.length === 0 && (
              <div
                className="rounded-xl px-4 py-3 text-[0.8rem] leading-relaxed"
                style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text2 }}
              >
                Ask me to edit your course — rename modules, rewrite lessons, reshuffle content, update quizzes, and more.
                {onApplyCourseUpdate
                  ? ' Changes apply to the editor instantly; click Save when you are happy.'
                  : ' Open the course editor to apply structural changes.'}
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.82rem] leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: msg.role === 'user' ? C.red : C.bg1,
                    color: msg.role === 'user' ? '#fff' : C.text,
                    border: msg.role === 'user' ? 'none' : `1px solid ${C.border}`,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[0.78rem]" style={{ color: C.text3 }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                Working on it…
              </div>
            )}
          </div>

          {error && (
            <p className="px-4 pb-2 text-[0.75rem]" style={{ color: C.red }}>
              {error}
            </p>
          )}

          <div
            className="flex items-end gap-2 px-3 py-3"
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
              placeholder="e.g. Rename module 2 and shorten the intro lesson…"
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
      )}

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
