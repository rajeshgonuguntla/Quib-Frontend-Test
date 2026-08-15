import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Loader2, ChevronsRight } from 'lucide-react';
import axios from 'axios';
import { enrollCourse } from '../api/courseApi';
import { sendCourseChat, type CourseChatMessage } from '../api/courseChatApi';
import { useTheme, getC } from './ThemeContext';
import { LessonNotes } from './LessonNotes';

interface CourseChatWidgetProps {
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  moduleId?: string;
  signedIn: boolean;
  onSignInRequired?: () => void;
  /** Changes on login/logout/refresh — forces a fresh in-memory chat (never persisted). */
  sessionKey: string;
  /** `panel` = docked full-height column on the lesson page; `floating` = FAB overlay. */
  variant?: 'floating' | 'panel';
  /** Collapse the docked panel so the lesson column can grow. */
  onCollapse?: () => void;
}

function getChatError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (err.response?.status === 403) {
      return data?.message || 'Start learning to use the course tutor.';
    }
    if (err.response?.status === 429) {
      return 'Too many messages. Please wait a moment and try again.';
    }
    return data?.message || err.message || 'Unable to reach the tutor.';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unable to reach the tutor.';
}

export function CourseChatWidget({
  courseId,
  courseTitle,
  lessonId,
  moduleId,
  signedIn,
  onSignInRequired,
  sessionKey,
  variant = 'floating',
  onCollapse,
}: CourseChatWidgetProps) {
  const isPanel = variant === 'panel';
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [open, setOpen] = useState(isPanel);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CourseChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // In-memory only — reset when course or auth session changes (refresh/login/tab = new mount).
  useEffect(() => {
    setMessages([]);
    setInput('');
    setError(null);
    if (!isPanel) setOpen(false);
  }, [courseId, sessionKey, isPanel]);

  useEffect(() => {
    if ((open || isPanel) && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, isPanel, messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!signedIn) {
      onSignInRequired?.();
      return;
    }

    const userMessage: CourseChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    const tryChat = async () => {
      const res = await sendCourseChat(courseId, text, {
        lessonId,
        moduleId,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    };

    try {
      await tryChat();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        try {
          await enrollCourse(courseId);
          await tryChat();
          return;
        } catch (retryErr) {
          setMessages((prev) => prev.slice(0, -1));
          setError(getChatError(retryErr));
        }
      } else {
        setMessages((prev) => prev.slice(0, -1));
        setError(getChatError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const panelBg = isDark ? 'rgba(12,12,16,0.98)' : 'rgba(255,255,255,0.98)';

  const chatPanel = (
    <div
      className={
        isPanel
          ? 'flex h-full min-h-0 w-full flex-col overflow-hidden'
          : 'flex flex-col overflow-hidden rounded-2xl shadow-2xl'
      }
      style={
        isPanel
          ? { background: C.bg }
          : {
              width: 'min(380px, calc(100vw - 2rem))',
              height: 'min(520px, calc(100vh - 8rem))',
              background: panelBg,
              border: `1px solid ${C.border}`,
              backdropFilter: 'blur(20px)',
            }
      }
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 px-4 py-3"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.bg1 }}
      >
        <div className="min-w-0 flex-1 overflow-hidden pr-2">
          <p className="text-[0.85rem] font-[600] truncate" style={{ color: C.text }}>
            Course tutor
          </p>
          <p className="text-[0.7rem] truncate" style={{ color: C.text3 }}>
            {courseTitle}
          </p>
        </div>
        {(isPanel && onCollapse) || !isPanel ? (
          <button
            type="button"
            onClick={() => (isPanel ? onCollapse?.() : setOpen(false))}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer shrink-0"
            style={{ background: C.red, color: '#fff', border: 'none' }}
            aria-label={isPanel ? 'Collapse course tutor' : 'Close chat'}
            title={isPanel ? 'Collapse tutor' : 'Close'}
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
          <div
            className="rounded-xl px-4 py-3 text-[0.8rem] leading-relaxed"
            style={{ background: C.bg1, border: `1px solid ${C.border}`, color: C.text2 }}
          >
            {signedIn
              ? 'Hi! Ask me anything about this course — I\'m here to help.'
              : 'Sign in to chat with your course tutor.'}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.82rem] leading-relaxed ${
                msg.role === 'user'
                  ? 'whitespace-pre-wrap'
                  : '[&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_ul]:mb-1.5 [&_ul:last-child]:mb-0 [&_pre]:mb-2 [&_h2]:mt-2 [&_h3]:mt-2 [&_.lesson-notes]:text-[0.82rem]'
              }`}
              style={{
                background: msg.role === 'user' ? C.red : C.bg1,
                color: msg.role === 'user' ? '#fff' : C.text,
                border: msg.role === 'user' ? 'none' : `1px solid ${C.border}`,
              }}
            >
              {msg.role === 'assistant' ? (
                <LessonNotes
                  content={msg.content}
                  theme={{
                    text: C.text,
                    text2: C.text2,
                    text3: C.text3,
                    border: C.border,
                    bg1: C.bg1,
                    bg2: C.bg2,
                    red: C.red,
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[0.78rem]" style={{ color: C.text3 }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Thinking…
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
          placeholder={signedIn ? 'Ask a question about this course…' : 'Sign in to ask a question…'}
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
          aria-label="Send message"
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
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
      {open && chatPanel}

      <button
        type="button"
        onClick={() => {
          if (!signedIn) {
            onSignInRequired?.();
            return;
          }
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
        style={{
          background: C.red,
          color: '#fff',
          border: 'none',
          boxShadow: '0 8px 32px rgba(225,6,0,0.35)',
        }}
        aria-label={open ? 'Close course tutor' : 'Open course tutor'}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-[0.82rem] font-[600] hidden sm:inline">
          {open ? 'Close tutor' : 'Ask tutor'}
        </span>
      </button>
    </div>
  );
}
