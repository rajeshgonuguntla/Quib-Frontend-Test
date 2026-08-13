import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  Expand,
  Flag,
  Focus,
  Hammer,
  Layers,
  LayoutGrid,
  ListChecks,
  ListVideo,
  Loader2,
  Rocket,
  Scissors,
  Sprout,
  Target,
} from 'lucide-react';
import { isYoutubePlaylistUrl, getYoutubeUrlValidationError } from '../utils/youtubeUrl';
import {
  answersToGenerationOptions,
  buildFollowupQuestions,
  detectNiche,
  fetchYoutubeMeta,
  type FollowupAnswer,
  type FollowupOption,
  type VideoNiche,
} from '../utils/courseBuilderFollowups';
import { cn } from './ui/utils';

const ICONS: Record<string, typeof Sprout> = {
  sprout: Sprout,
  layers: Layers,
  rocket: Rocket,
  hammer: Hammer,
  briefcase: Briefcase,
  brain: Brain,
  'list-video': ListVideo,
  'layout-grid': LayoutGrid,
  'list-checks': ListChecks,
  flag: Flag,
  target: Target,
  focus: Focus,
  scissors: Scissors,
  expand: Expand,
};

function OptionIcon({ name }: { name: string }) {
  const Icon = ICONS[name] ?? Layers;
  return <Icon size={18} className="text-[var(--brand)]" />;
}

export function CourseBuilderFollowupsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const youtubeUrl = (location.state?.youtubeUrl as string | undefined)?.trim() ?? '';

  const [niche, setNiche] = useState<VideoNiche>('general');
  const [videoTitle, setVideoTitle] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<FollowupAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const questions = useMemo(() => buildFollowupQuestions(niche), [niche]);
  const current = questions[step];
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    if (!youtubeUrl || getYoutubeUrlValidationError(youtubeUrl)) {
      navigate('/dashboard', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingMeta(true);
      const meta = await fetchYoutubeMeta(youtubeUrl);
      if (cancelled) return;
      const detected = detectNiche(`${meta.title} ${meta.author} ${youtubeUrl}`);
      setNiche(detected);
      setVideoTitle(meta.title);
      setLoadingMeta(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [youtubeUrl, navigate]);

  const pick = (option: FollowupOption) => {
    if (!current) return;
    setSelected(option.id);
    const nextAnswer: FollowupAnswer = {
      questionId: current.id,
      optionId: option.id,
      label: option.label,
    };
    const nextAnswers = [...answers.filter((a) => a.questionId !== current.id), nextAnswer];

    // Small delay so the card selection feels intentional (honen-like)
    window.setTimeout(() => {
      setAnswers(nextAnswers);
      setSelected(null);
      if (step >= questions.length - 1) {
        const { options, notes } = answersToGenerationOptions(nextAnswers);
        navigate('/course-details', {
          state: {
            youtubeUrl,
            generationOptions: options,
            builderBrief: {
              niche,
              videoTitle,
              answers: nextAnswers,
              notes,
            },
            from: '/course-builder',
          },
          replace: true,
        });
        return;
      }
      setStep((s) => s + 1);
    }, 220);
  };

  if (!youtubeUrl) return null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-1 py-2">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate('/dashboard'))}
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          {step > 0 ? 'Back' : 'Cancel'}
        </button>

        <p className="text-label mb-2 text-muted-foreground">Course builder</p>
        <h1 className="text-heading text-2xl sm:text-3xl">
          {loadingMeta ? 'Looking at your video…' : 'A few quick questions'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {videoTitle
            ? `Building from “${videoTitle}”`
            : 'Answers shape difficulty, structure, and quizzes before we generate.'}
        </p>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
            style={{ width: `${loadingMeta ? 8 : progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {loadingMeta ? 'Detecting niche…' : `Question ${step + 1} of ${questions.length}`}
        </p>

        {loadingMeta || !current ? (
          <div className="mt-16 flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-[var(--brand)]" />
            <p className="text-sm">Preparing follow-ups…</p>
          </div>
        ) : (
          <div className="mt-10 flex flex-1 flex-col">
            <div className="mb-6 rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[0.7rem] font-medium uppercase tracking-wider text-[var(--brand)]">
                Course assistant
              </p>
              <p className="mt-2 text-base font-medium leading-snug text-foreground sm:text-lg">
                {current.prompt}
              </p>
            </div>

            <div className="grid gap-3">
              {current.options.map((option) => {
                const active = selected === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => pick(option)}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all',
                      active
                        ? 'border-[var(--brand)] bg-[rgba(225,6,0,0.08)] scale-[0.99]'
                        : 'border-border bg-card hover:border-[var(--brand)]/50 hover:bg-muted/40',
                    )}
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <OptionIcon name={option.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className={cn('mt-2 shrink-0', active ? 'text-[var(--brand)]' : 'text-muted-foreground')}
                    />
                  </button>
                );
              })}
            </div>

            {isYoutubePlaylistUrl(youtubeUrl) && step === 0 && (
              <p className="mt-6 text-xs text-muted-foreground">
                Playlist detected — modules will cover the selected videos after these questions.
              </p>
            )}
          </div>
        )}
    </div>
  );
}
