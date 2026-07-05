import { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { reportOutdatedContent } from '../api/courseFeedbackApi';

type ReportOutdatedContentModalProps = {
  courseId: string;
  lessonId?: string;
  lessonTitle?: string;
  onClose: () => void;
  onSubmitted: () => void;
  theme: {
    bg1: string;
    border: string;
    text: string;
    text2: string;
    text3: string;
    red: string;
  };
};

export function ReportOutdatedContentModal({
  courseId,
  lessonId,
  lessonTitle,
  onClose,
  onSubmitted,
  theme: C,
}: ReportOutdatedContentModalProps) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError('Please describe what seems outdated (at least 5 characters).');
      return;
    }
    setSaving(true);
    try {
      await reportOutdatedContent(courseId, {
        lessonId,
        reason: trimmed,
      });
      setDone(true);
      onSubmitted();
    } catch {
      setError('Could not submit your report. You may have already reported this content.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-outdated-title"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{ background: C.bg1, border: `1px solid ${C.border}` }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" style={{ color: C.red }} />
            <div>
              <h2 id="report-outdated-title" className="text-lg font-semibold" style={{ color: C.text }}>
                Report outdated content
              </h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: C.text2 }}>
                {lessonTitle
                  ? `Flag "${lessonTitle}" so the educator can refresh it.`
                  : 'Let the educator know this course needs an update.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-black/5"
            aria-label="Close"
          >
            <X className="size-4" style={{ color: C.text3 }} />
          </button>
        </div>

        {done ? (
          <p className="text-sm leading-relaxed" style={{ color: C.text2 }}>
            Thank you — your report was sent to the course educator.
          </p>
        ) : (
          <>
            <label htmlFor="outdated-reason" className="text-xs font-medium uppercase tracking-wide" style={{ color: C.text3 }}>
              What seems outdated?
            </label>
            <textarea
              id="outdated-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="e.g. The API version shown in lesson 3 was deprecated…"
              className="mt-2 w-full resize-none rounded-lg px-3 py-2.5 text-sm outline-none"
              style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
            />
            <p className="mt-1 text-[0.65rem]" style={{ color: C.text3 }}>
              {reason.trim().length}/500 · One open report per lesson
            </p>
            {error && <p className="mt-2 text-sm" style={{ color: C.red }}>{error}</p>}
          </>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm"
            style={{ border: `1px solid ${C.border}`, color: C.text2, background: 'transparent' }}
          >
            {done ? 'Close' : 'Cancel'}
          </button>
          {!done && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSubmit()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60"
              style={{ background: C.red, color: '#fff', border: 'none' }}
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
