import { useEffect, useState } from 'react';
import { Flag, Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  fetchLessonComments,
  postLessonComment,
  reportContentFlag,
  setLessonReaction,
  type LessonComment,
} from '../api/courseFeedbackApi';

type Theme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  red: string;
};

type Props = {
  courseId: string;
  lessonId: string;
  enabled: boolean;
  theme: Theme;
};

export function LessonFeedbackPanel({ courseId, lessonId, enabled, theme: C }: Props) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [draft, setDraft] = useState('');
  const [reaction, setReaction] = useState(0);
  const [up, setUp] = useState(0);
  const [down, setDown] = useState(0);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !courseId || !lessonId) return;
    let mounted = true;
    setMsg(null);
    setErr(null);
    setDraft('');
    setFlagOpen(false);
    setFlagReason('');
    setReaction(0);
    setUp(0);
    setDown(0);
    const load = async () => {
      try {
        const list = await fetchLessonComments(courseId, lessonId);
        if (mounted) setComments(list);
      } catch {
        if (mounted) setComments([]);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [courseId, lessonId, enabled]);

  if (!enabled) return null;

  const onReact = async (next: 1 | -1) => {
    const value = reaction === next ? 0 : next;
    setBusy(true);
    setErr(null);
    try {
      const res = await setLessonReaction(courseId, lessonId, value as 1 | 0 | -1);
      setReaction(res.value);
      setUp(res.thumbsUp);
      setDown(res.thumbsDown);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not save reaction');
    } finally {
      setBusy(false);
    }
  };

  const onComment = async () => {
    const body = draft.trim();
    if (body.length < 2) return;
    setBusy(true);
    setErr(null);
    try {
      const created = await postLessonComment(courseId, lessonId, body);
      setComments((prev) => [created, ...prev]);
      setDraft('');
      setMsg('Comment posted');
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } };
      setErr(ax.response?.data?.message || 'Could not post comment');
    } finally {
      setBusy(false);
    }
  };

  const onFlag = async () => {
    const reason = flagReason.trim();
    if (reason.length < 5) {
      setErr('Describe what’s outdated (at least 5 characters)');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await reportContentFlag(courseId, reason, lessonId);
      setFlagOpen(false);
      setFlagReason('');
      setMsg('Thanks — we flagged this for the educator');
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } };
      setErr(ax.response?.data?.message || 'Could not submit report');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl p-5" style={{ border: `1px solid ${C.border}`, background: C.bg1 }}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm font-medium" style={{ color: C.text }}>
          Lesson feedback
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onReact(1)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{
            border: `1px solid ${C.border}`,
            background: reaction === 1 ? 'rgba(34,197,94,0.12)' : 'transparent',
            color: reaction === 1 ? '#22c55e' : C.text2,
          }}
          aria-pressed={reaction === 1}
        >
          <ThumbsUp className="size-3.5" /> {up || ''}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onReact(-1)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{
            border: `1px solid ${C.border}`,
            background: reaction === -1 ? 'rgba(225,6,0,0.1)' : 'transparent',
            color: reaction === -1 ? C.red : C.text2,
          }}
          aria-pressed={reaction === -1}
        >
          <ThumbsDown className="size-3.5" /> {down || ''}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setFlagOpen((v) => !v);
            setErr(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
          style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text2 }}
        >
          <Flag className="size-3.5" /> Report outdated
        </button>
      </div>

      {flagOpen && (
        <div className="mb-4 space-y-2">
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What’s outdated or wrong in this lesson?"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
            style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void onFlag()}
            className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
            style={{ background: C.red, color: '#fff', border: 'none' }}
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : 'Submit report'}
          </button>
        </div>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="Ask a question or leave a comment for the educator"
        className="mb-2 w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
        style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
      />
      <button
        type="button"
        disabled={busy || draft.trim().length < 2}
        onClick={() => void onComment()}
        className="mb-4 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: C.red, color: '#fff', border: 'none' }}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : 'Post comment'}
      </button>

      {err && (
        <p className="mb-2 text-xs" style={{ color: C.red }}>
          {err}
        </p>
      )}
      {msg && (
        <p className="mb-2 text-xs" style={{ color: '#22c55e' }}>
          {msg}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-xs" style={{ color: C.text3 }}>
          No comments yet on this lesson.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg px-3 py-2" style={{ border: `1px solid ${C.border}` }}>
              <p className="text-xs font-medium" style={{ color: C.text2 }}>
                {c.authorName || 'Learner'}
                {c.answered ? ' · answered' : ''}
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap" style={{ color: C.text }}>
                {c.body}
              </p>
              {c.educatorReply ? (
                <p className="mt-2 text-xs whitespace-pre-wrap" style={{ color: C.text2 }}>
                  Educator: {c.educatorReply}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
