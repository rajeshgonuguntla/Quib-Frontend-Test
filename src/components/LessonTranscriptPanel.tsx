import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchLessonTranscript, type TranscriptCue } from '../api/lessonTranscriptApi';
import { formatNoteTimestamp } from '../utils/noteTimestamps';
import type { LessonPlayerClock } from './StudentLessonNotesEditor';

type Theme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  bg2: string;
  red: string;
  redDim: string;
};

type Props = {
  courseId: string;
  lessonId: string;
  C: Theme;
  player?: LessonPlayerClock | null;
  enabled?: boolean;
  variant?: 'default' | 'cuib';
};

export function LessonTranscriptPanel({
  courseId,
  lessonId,
  C,
  player,
  enabled = true,
  variant = 'default',
}: Props) {
  const [cues, setCues] = useState<TranscriptCue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCues([]);
    setActiveIdx(-1);
    void fetchLessonTranscript(courseId, lessonId)
      .then((rows) => {
        if (!cancelled) setCues(rows);
      })
      .catch(() => {
        if (!cancelled) setError('Timed transcript unavailable for this lesson.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, enabled]);

  useEffect(() => {
    if (!player || cues.length === 0) return;
    let raf = 0;
    const tick = () => {
      const t = player.getCurrentTime?.() ?? 0;
      const idx = cues.findIndex((c) => t >= c.start && t < c.end);
      if (idx >= 0) setActiveIdx((prev) => (prev === idx ? prev : idx));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [player, cues]);

  useEffect(() => {
    if (activeIdx < 0) return;
    lineRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIdx]);

  if (!enabled) return null;

  const isCuib = variant === 'cuib';

  return (
    <div
      className={isCuib ? 'mt-6 pt-5' : 'rounded-2xl overflow-hidden mt-6'}
      style={isCuib ? { borderTop: `1px solid ${C.border}` } : { background: C.bg1, border: `1px solid ${C.border}` }}
    >
      <div
        className={`text-[0.66rem] uppercase tracking-wide mb-3.5 ${isCuib ? '' : 'px-4 py-3 border-b'}`}
        style={{
          color: C.text3,
          fontFamily: 'var(--mono)',
          fontWeight: 500,
          ...(isCuib ? {} : { borderBottom: `1px solid ${C.border}` }),
        }}
      >
        Transcript
      </div>
      {loading && (
        <div className={`flex items-center gap-2 py-4 text-[0.82rem] ${isCuib ? '' : 'px-4'}`} style={{ color: C.text3 }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading transcript…
        </div>
      )}
      {error && !loading && (
        <p className={`py-3 text-[0.82rem] ${isCuib ? '' : 'px-4'}`} style={{ color: C.text3 }}>{error}</p>
      )}
      {!loading && !error && cues.length === 0 && (
        <p className={`py-3 text-[0.82rem] ${isCuib ? '' : 'px-4'}`} style={{ color: C.text3 }}>
          No timed captions for this video.
        </p>
      )}
      {!loading && cues.length > 0 && (
        <div ref={listRef} className={`max-h-[190px] overflow-y-auto ${isCuib ? 'pr-3' : 'px-2 py-2 space-y-0.5 max-h-[320px]'}`}>
          {cues.map((cue, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={`${cue.start}-${idx}`}
                type="button"
                ref={(el) => {
                  lineRefs.current[idx] = el;
                }}
                onClick={() => player?.seekTo?.(cue.start)}
                className={`w-full text-left flex gap-3 cursor-pointer transition-colors ${isCuib ? 'py-1.5' : 'px-3 py-2 rounded-lg'}`}
                style={{
                  background: !isCuib && active ? C.redDim : 'transparent',
                  color: active ? (isCuib ? C.text : C.red) : C.text2,
                  border: 'none',
                }}
              >
                <span
                  className="shrink-0 tabular-nums text-[0.7rem] pt-0.5"
                  style={{ color: active ? C.red : C.text3, fontFamily: 'var(--mono)', minWidth: 40 }}
                >
                  {formatNoteTimestamp(cue.start)}
                </span>
                <span className="text-[0.84rem] leading-relaxed">{cue.text}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
