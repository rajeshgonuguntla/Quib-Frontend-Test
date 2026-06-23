import { useEffect, useState } from 'react';
import { useTheme, getC } from './ThemeContext';
import {
  COURSE_GENERATION_MESSAGES,
  COURSE_GEN_ESTIMATE_MAX_SEC,
  COURSE_GEN_ESTIMATE_MIN_SEC,
  estimateCourseGenerationProgress,
  formatElapsed,
} from '../utils/courseGenerationLoading';

type Props = {
  title?: string;
  subtitle?: string;
};

export function CourseGenerationLoader({
  title = 'Building Your Course',
  subtitle = 'This usually takes 2–5 minutes',
}: Props) {
  const { isDark } = useTheme();
  const C = getC(isDark);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const rotate = setInterval(() => {
      setMessageIndex((i) => (i + 1) % COURSE_GENERATION_MESSAGES.length);
    }, 4500);
    return () => clearInterval(rotate);
  }, []);

  const progress = estimateCourseGenerationProgress(elapsedSec);
  const message = COURSE_GENERATION_MESSAGES[messageIndex];

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center mb-8">
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 400, color: C.text, marginBottom: 8 }}>
          {title}
        </h2>
        <p className="text-[0.85rem]" style={{ color: C.text2 }}>{subtitle}</p>
      </div>

      <div className="rounded-xl p-6" style={{ background: C.bg1, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-[500]" style={{ color: C.text2 }}>Elapsed</span>
          <span className="text-sm font-[600] tabular-nums" style={{ color: C.text }}>{formatElapsed(elapsedSec)}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-[500]" style={{ color: C.text2 }}>Generating course…</span>
          <span className="text-sm font-[600] tabular-nums" style={{ color: C.text }}>{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.bg2 }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: C.red }}
          />
        </div>
        <p className="mt-3 text-[0.72rem] tabular-nums" style={{ color: C.text3 }}>
          Typical wait: {Math.floor(COURSE_GEN_ESTIMATE_MIN_SEC / 60)}–{Math.floor(COURSE_GEN_ESTIMATE_MAX_SEC / 60)} min
        </p>
      </div>

      <div
        className="p-5 rounded-xl text-center min-h-[4.5rem] flex items-center justify-center"
        style={{ background: C.bg1, border: `1px solid ${C.border}` }}
      >
        <p className="text-sm font-[400] italic transition-opacity duration-500" style={{ color: C.text2 }}>
          {message}
        </p>
      </div>
    </div>
  );
}
