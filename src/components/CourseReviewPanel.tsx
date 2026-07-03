import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { fetchMyCourseReview, submitCourseReview } from '../api/courseFeedbackApi';

type CourseReviewPanelProps = {
  courseId: string;
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

export function CourseReviewPanel({ courseId, enabled, theme: C }: CourseReviewPanelProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const load = async () => {
      try {
        const review = await fetchMyCourseReview(courseId);
        if (mounted && review) {
          setRating(review.rating);
          setReviewText(review.reviewText ?? '');
          setSaved(true);
        }
      } catch {
        /* no review yet */
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [courseId, enabled]);

  if (!enabled) return null;

  const handleSubmit = async () => {
    if (rating < 1) return;
    setLoading(true);
    try {
      await submitCourseReview(courseId, rating, reviewText.trim() || undefined);
      setSaved(true);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl p-5" style={{ border: `1px solid ${C.border}`, background: C.bg1 }}>
      <p className="mb-3 text-sm font-medium" style={{ color: C.text }}>Rate this course</p>
      <div className="mb-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="p-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label={`${n} stars`}
          >
            <Star
              className="size-5"
              fill={n <= rating ? C.red : 'transparent'}
              style={{ color: n <= rating ? C.red : C.text3 }}
            />
          </button>
        ))}
      </div>
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Optional review (helps other learners and your educator)"
        className="mb-3 w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
        style={{ border: `1px solid ${C.border}`, background: 'transparent', color: C.text }}
      />
      <button
        type="button"
        disabled={loading || rating < 1}
        onClick={() => void handleSubmit()}
        className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: C.red, color: '#fff', border: 'none' }}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : saved ? 'Update review' : 'Submit review'}
      </button>
    </div>
  );
}
