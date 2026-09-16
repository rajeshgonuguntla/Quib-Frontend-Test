import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { sendCourseChat } from '../api/courseChatApi';
import { buildQuizHelpMessage, type QuizHelpKind } from '../utils/quizSecondChance';

type Theme = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg2: string;
  red: string;
};

interface ModuleQuizSecondChanceProps {
  courseId: string;
  moduleId: string;
  question: string;
  options: string[];
  C: Theme;
}

const ACTIONS: { kind: QuizHelpKind | 'retry'; label: string }[] = [
  { kind: 'hint', label: 'Hint' },
  { kind: 'simpler', label: 'Simpler example' },
  { kind: 'retry', label: 'Retry question' },
  { kind: 'similar', label: 'Similar question' },
];

export function ModuleQuizSecondChance({
  courseId,
  moduleId,
  question,
  options,
  C,
  onRetry,
}: ModuleQuizSecondChanceProps & { onRetry: () => void }) {
  const [help, setHelp] = useState<{ kind: QuizHelpKind; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runHelp = async (kind: QuizHelpKind) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendCourseChat(courseId, buildQuizHelpMessage(kind, question, options), {
        moduleId,
      });
      setHelp({ kind, text: res.reply });
    } catch {
      setError('Could not load help. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="mt-4 rounded-xl px-4 py-3 space-y-3"
      style={{ background: 'rgba(225,6,0,0.06)', border: `1px solid rgba(225,6,0,0.2)` }}
    >
      <p className="text-[0.82rem] font-[500]" style={{ color: C.text }}>
        You missed this one — want a second chance?
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.kind}
            type="button"
            disabled={loading}
            onClick={() => {
              if (action.kind === 'retry') {
                onRetry();
                return;
              }
              void runHelp(action.kind);
            }}
            className="px-3 py-1.5 rounded-lg text-[0.75rem] font-[500] cursor-pointer disabled:opacity-50"
            style={{
              background: C.bg2,
              border: `1px solid ${C.border}`,
              color: C.text2,
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      {loading && (
        <p className="flex items-center gap-2 text-[0.75rem]" style={{ color: C.text3 }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Working on it…
        </p>
      )}
      {error && (
        <p className="text-[0.75rem]" style={{ color: C.red }}>
          {error}
        </p>
      )}
      {help && !loading && (
        <div
          className="rounded-lg px-3 py-2 text-[0.78rem] leading-relaxed whitespace-pre-wrap"
          style={{ background: C.bg2, border: `1px solid ${C.border}`, color: C.text2 }}
        >
          {help.text}
        </div>
      )}
    </div>
  );
}
