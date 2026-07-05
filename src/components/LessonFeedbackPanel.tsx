import { useEffect, useState } from 'react';
import { Flag, Loader2, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  fetchLessonComments,
  postLessonComment,
  setLessonReaction,
  type LessonComment,
} from '../api/courseFeedbackApi';
import { ReportOutdatedContentModal } from './ReportOutdatedContentModal';

type LessonFeedbackPanelProps = {
  courseId: string;
  lessonId: string;
  lessonTitle?: string;
  enabled: boolean;
  theme: {
    text: string;
    text2: string;
    text3: string;
    border: string;
    bg1: string;
    red: string;
  };
};

export function LessonFeedbackPanel({
  courseId,
  lessonId,
  lessonTitle,
  enabled,
  theme: C,
}: LessonFeedbackPanelProps) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [reaction, setReaction] = useState(0);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [thumbsDown, setThumbsDown] = useState(0);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (!enabled || !lessonId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchLessonComments(courseId, lessonId);
        if (mounted) setComments(list);
      } catch {
        if (mounted) setComments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [courseId, lessonId, enabled]);

  if (!enabled) return null;

  const handleReaction = async (value: -1 | 0 | 1) => {
    try {
      const next = reaction === value ? 0 : value;
      const res = await setLessonReaction(courseId, lessonId, next as -1 | 0 | 1);
      setReaction(res.value);
      setThumbsUp(res.thumbsUp);
      setThumbsDown(res.thumbsDown);
    } catch {
      /* ignore */
    }
  };

  const handlePost = async () => {
    const body = draft.trim();
    if (body.length < 2) return;
    setPosting(true);
    try {
      const created = await postLessonComment(courseId, lessonId, body);
      setComments((prev) => [created, ...prev]);
      setDraft('');
    } catch {
      /* ignore */
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-10 rounded-2xl p-5" style={{ border: `1px solid ${C.border}`, background: C.bg1 }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4" style={{ color: C.text3 }} />
          <span className="text-sm font-medium" style={{ color: C.text }}>Lesson feedback</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowReport(true)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
            style={{ border: `1px solid ${C.border}`, color: C.text2, background: 'transparent' }}
          >
            <Flag className="size-3.5" /> Report outdated
          </button>
          <button
            type="button"
            onClick={() => void handleReaction(1)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
            style={{
              border: `1px solid ${reaction === 1 ? C.red : C.border}`,
              color: reaction === 1 ? C.red : C.text2,
              background: 'transparent',
            }}
          >
            <ThumbsUp className="size-3.5" /> {thumbsUp || '—'}
          </button>
          <button
            type="button"
            onClick={() => void handleReaction(-1)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
            style={{
              border: `1px solid ${reaction === -1 ? C.red : C.border}`,
              color: reaction === -1 ? C.red : C.text2,
              background: 'transparent',
            }}
          >
            <ThumbsDown className="size-3.5" /> {thumbsDown || '—'}
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          placeholder="Ask a question about this lesson…"
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
          style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
        />
        <button
          type="button"
          disabled={posting || draft.trim().length < 2}
          onClick={() => void handlePost()}
          className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          style={{ background: C.red, color: '#fff', border: 'none' }}
        >
          {posting ? <Loader2 className="size-4 animate-spin" /> : 'Post'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-xs" style={{ color: C.text3 }}>Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="text-xs" style={{ color: C.text3 }}>No questions yet. Be the first to ask.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-lg p-3 text-sm" style={{ border: `1px solid ${C.border}` }}>
              <p className="text-xs font-medium" style={{ color: C.text3 }}>{c.authorName}</p>
              <p className="mt-1" style={{ color: C.text2 }}>{c.body}</p>
              {c.answered && c.educatorReply && (
                <div className="mt-2 rounded-md p-2 text-xs" style={{ background: 'rgba(34,197,94,0.08)', color: C.text2 }}>
                  <span className="font-medium" style={{ color: '#22c55e' }}>Educator reply: </span>
                  {c.educatorReply}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showReport && (
        <ReportOutdatedContentModal
          courseId={courseId}
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          theme={C}
          onClose={() => setShowReport(false)}
          onSubmitted={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
