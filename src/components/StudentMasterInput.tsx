import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ArrowRight, List, Plus, Search, Upload, X } from 'lucide-react';
import {
  getYoutubeUrlValidationError,
  isYoutubePlaylistUrl,
  isYoutubeVideoUrl,
} from '../utils/youtubeUrl';
import {
  STUDENT_UPLOAD_ENABLED,
  STUDENT_YOUTUBE_INPUT_ENABLED,
} from '../utils/studentInputModes';
import { cn } from './ui/utils';
import { useUserProfile } from '../context/UserProfileContext';
import { useTheme } from './ThemeContext';
import {
  clickLandingGoogleSignIn,
  completeGoogleSignIn,
  stashLearnerStartState,
  type LearnerStartState,
} from '../utils/completeGoogleSignIn';
import {
  LEARNER_START_TABS,
  isLearnerStartModeReady,
  type LearnerStartMode,
  type SampleExamType,
} from '../utils/learnerStartMode';
import { inferExamTypeFromText, resolveExamType } from '../utils/examType';
import { fetchEnrollments } from '../api/catalogApi';
import { sendCourseChat, type CourseChatMessage } from '../api/courseChatApi';
import { cubitAskError, isCubitQuestion, pickCubitAskCourse } from '../utils/cubitAsk';
import {
  CHAT_STRIP_LIMIT,
  chatsForMenu,
  chatStamp,
  formatChatTabTime,
  latestChatForMode,
  newChatShortcutLabel,
  visibleChatTabs,
} from '../utils/chatWindowTabs';
import { StandaloneNotesWorkspace } from './StandaloneNotesWorkspace';

export type { LearnerStartMode, SampleExamType } from '../utils/learnerStartMode';
export {
  LEARNER_START_TABS,
  isLearnerStartModeReady,
  studyToolFromStartMode,
} from '../utils/learnerStartMode';

const COURSE_PHRASES = [
  'Paste a YouTube URL to create a course',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const NOTES_PHRASES = [
  'Paste a YouTube URL for notes',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const FLASHCARD_PHRASES = [
  'Paste a YouTube URL for flashcards',
  'youtube.com/watch?v=…',
  'Or a playlist URL (list=…)',
];

const QUIZ_PHRASES = [
  'SAT math: linear equations',
  'GRE verbal: analogies',
  'Test me on photosynthesis',
  'Or paste a YouTube URL',
];

const EXAM_TYPES: { id: SampleExamType; label: string }[] = [
  { id: 'custom', label: 'Custom' },
  { id: 'sat', label: 'SAT' },
  { id: 'gre', label: 'GRE' },
];

type ChatWindow = {
  id: string;
  mode: LearnerStartMode;
  title: string;
  question: string | null;
  reply: string | null;
  courseTitle: string | null;
  error: string | null;
  busy: boolean;
  history: CourseChatMessage[];
  draft: string;
  openedAt: number;
  updatedAt: number | null;
  lastFocusedAt: number;
};

type StudentMasterInputProps = {
  className?: string;
  signedIn?: boolean;
  /** Lock the start bar to one tool (Practice page uses quiz). */
  lockMode?: LearnerStartMode;
  /** Studio uses the same bar, then keeps the URL in the studio chat. */
  onCourseSubmit?: (url: string) => void;
  /** Dashboard greeting is still on screen, so the open card can sit under it. */
  greetingVisible?: boolean;
  /** Fires once when the first chat window opens. */
  onChatOpen?: () => void;
  inputTestId?: string;
  submitTestId?: string;
};

function VideoGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M10 9l5 3-5 3z" />
    </svg>
  );
}

export function StudentMasterInput({
  className,
  signedIn = true,
  lockMode,
  onCourseSubmit,
  greetingVisible = false,
  onChatOpen,
  inputTestId,
  submitTestId,
}: StudentMasterInputProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile } = useUserProfile();
  const { isDark } = useTheme();
  const [mode, setMode] = useState<LearnerStartMode>(lockMode ?? 'cubit');
  const [examType, setExamType] = useState<SampleExamType>('custom');
  const [examPinned, setExamPinned] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [phText, setPhText] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [fillHeight, setFillHeight] = useState<number | null>(null);
  const pendingRef = useRef<LearnerStartState | null>(null);
  const cubitCourseRef = useRef<{ id: string; title: string } | null>(null);
  const cubitHistoryRef = useRef<CourseChatMessage[]>([]);
  const cubitAskedRef = useRef(false);
  const windowSeq = useRef(1);
  const windowsRef = useRef<ChatWindow[]>([]);
  const activeWindowIdRef = useRef<string | null>(null);
  const modeRef = useRef(mode);
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [chatsMenuOpen, setChatsMenuOpen] = useState(false);
  const [chatsQuery, setChatsQuery] = useState('');
  const [now, setNow] = useState(() => chatStamp());
  const tabListRef = useRef<HTMLDivElement>(null);
  const chatsMenuRef = useRef<HTMLDivElement>(null);
  const chatsSearchRef = useRef<HTMLInputElement>(null);
  const openNewChatRef = useRef<() => void>(() => {});
  const newChatKeys = newChatShortcutLabel(typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const [cubitReply, setCubitReply] = useState<string | null>(null);
  const [cubitQuestion, setCubitQuestion] = useState<string | null>(null);
  const [cubitCourseTitle, setCubitCourseTitle] = useState<string | null>(null);
  const [cubitBusy, setCubitBusy] = useState(false);
  const phraseIdx = useRef(0);
  const activeRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rememberWindows = (next: ChatWindow[]) => {
    const opening = windowsRef.current.length === 0 && next.length > 0;
    windowsRef.current = next;
    setChatWindows(next);
    if (opening) onChatOpen?.();
  };

  const patchWindow = (id: string, patch: Partial<ChatWindow>) => {
    rememberWindows(windowsRef.current.map((window) => (window.id === id ? { ...window, ...patch } : window)));
  };

  const snapshotWindow = (savedMode: LearnerStartMode = mode): ChatWindow => {
    const existing = windowsRef.current.find((window) => window.id === activeWindowIdRef.current);
    const stamp = chatStamp();
    return {
      id: activeWindowIdRef.current ?? `chat-${windowSeq.current}`,
      mode: savedMode,
      title: cubitQuestion?.trim() || 'New chat',
      question: cubitQuestion,
      reply: cubitReply,
      courseTitle: cubitCourseTitle,
      error,
      busy: cubitBusy,
      history: cubitHistoryRef.current,
      draft: inputValue,
      openedAt: existing?.openedAt ?? stamp,
      updatedAt: existing?.updatedAt ?? (cubitQuestion ? stamp : null),
      lastFocusedAt: existing?.lastFocusedAt ?? stamp,
    };
  };

  const showWindow = (window: ChatWindow) => {
    activeWindowIdRef.current = window.id;
    setActiveWindowId(window.id);
    setMode(lockMode ?? window.mode);
    setCubitQuestion(window.question);
    setCubitReply(window.reply);
    setCubitCourseTitle(window.courseTitle);
    setError(window.error);
    setCubitBusy(window.busy);
    setInputValue(window.draft);
    cubitHistoryRef.current = window.history;
  };

  const clearVisibleChat = () => {
    activeWindowIdRef.current = null;
    setActiveWindowId(null);
    setCubitQuestion(null);
    setCubitReply(null);
    setCubitCourseTitle(null);
    setError(null);
    setCubitBusy(false);
    setInputValue('');
    cubitHistoryRef.current = [];
  };

  const ensureActiveWindow = (text: string) => {
    const stamp = chatStamp();
    const current = windowsRef.current.find((window) => window.id === activeWindowIdRef.current);
    if (current && current.mode === mode) {
      patchWindow(current.id, {
        title: text,
        question: text,
        reply: null,
        error: null,
        busy: true,
        draft: '',
        updatedAt: stamp,
        lastFocusedAt: stamp,
      });
      return current.id;
    }
    const id = `chat-${windowSeq.current++}`;
    const created: ChatWindow = {
      id,
      mode,
      title: text,
      question: text,
      reply: null,
      courseTitle: null,
      error: null,
      busy: true,
      history: [],
      draft: '',
      openedAt: stamp,
      updatedAt: stamp,
      lastFocusedAt: stamp,
    };
    activeWindowIdRef.current = id;
    setActiveWindowId(id);
    rememberWindows([...windowsRef.current, created]);
    return id;
  };

  const openNewChat = () => {
    const stamp = chatStamp();
    const currentId = activeWindowIdRef.current;
    const current = currentId ? snapshotWindow() : null;
    const id = `chat-${windowSeq.current++}`;
    const created: ChatWindow = {
      id,
      mode,
      title: 'New chat',
      question: null,
      reply: null,
      courseTitle: null,
      error: null,
      busy: false,
      history: [],
      draft: '',
      openedAt: stamp,
      updatedAt: null,
      lastFocusedAt: stamp,
    };
    const saved = current
      ? windowsRef.current.map((window) => (window.id === current.id ? current : window))
      : windowsRef.current;
    const base = current && !saved.some((window) => window.id === current.id) ? [...saved, current] : saved;
    rememberWindows([...base, created]);
    showWindow(created);
    setChatsMenuOpen(false);
  };

  const selectChatWindow = (id: string) => {
    if (id === activeWindowIdRef.current) return;
    const current = snapshotWindow();
    const next = windowsRef.current.find((window) => window.id === id);
    if (!next) return;
    const focused = { ...next, lastFocusedAt: chatStamp() };
    rememberWindows(windowsRef.current.map((window) => {
      if (window.id === current.id) return current;
      if (window.id === id) return focused;
      return window;
    }));
    showWindow(focused);
    setChatsMenuOpen(false);
  };

  const closeChatWindow = (id: string) => {
    const currentId = activeWindowIdRef.current;
    const base = currentId && currentId !== id
      ? windowsRef.current.map((window) => (window.id === currentId ? snapshotWindow() : window))
      : windowsRef.current;
    const modeList = base.filter((window) => window.mode === mode);
    const modeIndex = modeList.findIndex((window) => window.id === id);
    const remaining = base.filter((window) => window.id !== id);
    if (currentId !== id) {
      rememberWindows(remaining);
      return;
    }
    const remainingMode = remaining.filter((window) => window.mode === mode);
    const next = remainingMode[Math.min(Math.max(modeIndex, 0), remainingMode.length - 1)];
    if (!next) {
      rememberWindows(remaining);
      clearVisibleChat();
      setChatsMenuOpen(false);
      return;
    }
    const focused = { ...next, lastFocusedAt: chatStamp() };
    rememberWindows(remaining.map((window) => (window.id === focused.id ? focused : window)));
    showWindow(focused);
  };

  useEffect(() => {
    const previous = modeRef.current;
    if (previous === mode) return;
    modeRef.current = mode;
    const currentId = activeWindowIdRef.current;
    const saved = currentId
      ? windowsRef.current.map((window) => (window.id === currentId ? snapshotWindow(previous) : window))
      : windowsRef.current;
    if (currentId) rememberWindows(saved);
    const next = latestChatForMode(saved, mode);
    if (next) {
      const focused = { ...next, lastFocusedAt: chatStamp() };
      rememberWindows(saved.map((window) => (window.id === focused.id ? focused : window)));
      showWindow(focused);
    } else {
      clearVisibleChat();
    }
    setChatsMenuOpen(false);
  }, [mode]);
  const isQuizMode = mode === 'quiz';
  const isNotesMode = mode === 'notes';
  const isFlashcardsMode = mode === 'flashcards';
  const modeChatOpen = chatWindows.some((window) => window.mode === mode);
  const anyChatOpen = chatWindows.length > 0;
  const fillToBottom = anyChatOpen && !onCourseSubmit;
  const showTypewriter = !focused && !inputValue.trim();
  const phrases = isQuizMode
    ? QUIZ_PHRASES
    : isNotesMode
      ? NOTES_PHRASES
      : isFlashcardsMode
        ? FLASHCARD_PHRASES
        : COURSE_PHRASES;

  useEffect(() => {
    phraseIdx.current = 0;
  }, [mode]);

  useEffect(() => {
    if (!showTypewriter) {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhText('');
      return;
    }

    const media = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    if (media?.matches) {
      setPhText(phrases[0] ?? '');
      return;
    }

    activeRef.current = true;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerRef.current = setTimeout(resolve, ms);
      });

    const loop = async () => {
      while (activeRef.current) {
        const phrase = phrases[phraseIdx.current % phrases.length]!;
        for (let i = 0; i <= phrase.length; i++) {
          if (!activeRef.current) return;
          setPhText(phrase.slice(0, i));
          await wait(55);
        }
        await wait(1800);
        if (!activeRef.current) return;
        for (let i = phrase.length; i >= 0; i--) {
          if (!activeRef.current) return;
          setPhText(phrase.slice(0, i));
          await wait(30);
        }
        await wait(200);
        phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
      }
    };

    void loop();
    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showTypewriter, phrases]);

  const buildGuestPending = (): { ok: true; pending: LearnerStartState } | { ok: false; error: string } => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return { ok: true, pending: { signInIntent: 'student' } };
    }

    if (mode === 'cubit' && isCubitQuestion(trimmed)) {
      return { ok: true, pending: { cubitAsk: trimmed, signInIntent: 'student' } };
    }

    if (isQuizMode) {
      const isYt = isYoutubePlaylistUrl(trimmed) || isYoutubeVideoUrl(trimmed);
      if (isYt) {
        return {
          ok: true,
          pending: isYoutubePlaylistUrl(trimmed)
            ? { playlistUrl: trimmed, startTool: mode, signInIntent: 'student' }
            : { youtubeUrl: trimmed, startTool: mode, signInIntent: 'student' },
        };
      }
      if (trimmed.length < 8) {
        return { ok: false, error: 'Describe what you want to be tested on (or paste a YouTube URL).' };
      }
      return {
        ok: true,
        pending: {
          prompt: trimmed,
          examType: resolveExamType(examType, trimmed),
          startTool: 'quiz',
          signInIntent: 'student',
        },
      };
    }

    const validationError = getYoutubeUrlValidationError(inputValue);
    if (validationError) {
      return { ok: false, error: validationError };
    }
    return {
      ok: true,
      pending: isYoutubePlaylistUrl(trimmed)
        ? { playlistUrl: trimmed, startTool: mode, signInIntent: 'student' }
        : { youtubeUrl: trimmed, startTool: mode, signInIntent: 'student' },
    };
  };

  const rememberGuestPending = () => {
    const built = buildGuestPending();
    if (!built.ok) {
      setError(built.error);
      return false;
    }
    setError(null);
    pendingRef.current = built.pending;
    stashLearnerStartState(built.pending);
    return true;
  };

  const finishGoogleCredential = async (credentialResponse: CredentialResponse) => {
    setIsSigningIn(true);
    setError(null);
    const result = await completeGoogleSignIn({
      credentialResponse,
      navigate,
      setProfile,
      signInIntent: 'student',
      pendingState: pendingRef.current,
    });
    if (!result.ok) {
      setError(result.error);
    }
    setIsSigningIn(false);
  };

  /** Landing hero: open the same Google account chooser as the Continue with Google control. */
  const openLandingGoogleChooser = () => {
    if (!rememberGuestPending()) return;
    requestAnimationFrame(() => {
      clickLandingGoogleSignIn();
    });
  };

  useLayoutEffect(() => {
    if (!fillToBottom) {
      setFillHeight(null);
      return;
    }
    const card = cardRef.current;
    if (!card) return;

    const targetHeight = () => {
      const top = card.getBoundingClientRect().top;
      return Math.max(180, Math.round(window.innerHeight - top));
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = targetHeight();
    let frame = 0;
    if (reduced) {
      setFillHeight(target);
    } else {
      setFillHeight(Math.round(card.getBoundingClientRect().height));
      frame = requestAnimationFrame(() => setFillHeight(targetHeight()));
    }

    const onResize = () => setFillHeight(targetHeight());
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, [fillToBottom]);

  useEffect(() => {
    openNewChatRef.current = openNewChat;
  });

  useEffect(() => {
    if (!modeChatOpen) return;
    const tick = window.setInterval(() => setNow(chatStamp()), 30_000);
    return () => window.clearInterval(tick);
  }, [modeChatOpen]);

  useEffect(() => {
    const list = tabListRef.current;
    const selected = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !selected) return;
    const left = selected.offsetLeft;
    const right = left + selected.offsetWidth;
    if (left < list.scrollLeft) list.scrollLeft = left;
    else if (right > list.scrollLeft + list.clientWidth) list.scrollLeft = right - list.clientWidth;
  }, [activeWindowId, chatWindows.length]);

  useEffect(() => {
    if (!modeChatOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 't' || event.altKey || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;
      if (!cardRef.current?.contains(document.activeElement)) return;
      event.preventDefault();
      openNewChatRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modeChatOpen]);

  useEffect(() => {
    if (!chatsMenuOpen) return;
    chatsSearchRef.current?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!chatsMenuRef.current?.contains(event.target as Node)) setChatsMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChatsMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [chatsMenuOpen]);

  const askCubit = useCallback(async (text: string) => {
    const windowId = ensureActiveWindow(text);
    setCubitQuestion(text);
    setCubitReply(null);
    setInputValue('');
    setCubitBusy(true);
    setError(null);
    const stillHere = () => activeWindowIdRef.current === windowId;
    try {
      if (!cubitCourseRef.current) {
        const course = pickCubitAskCourse(await fetchEnrollments());
        if (!course) {
          const message = 'Enroll in a course to ask Cubit.';
          patchWindow(windowId, { error: message, busy: false });
          if (stillHere()) setError(message);
          return;
        }
        cubitCourseRef.current = { id: course.courseId, title: course.title };
      }
      const course = cubitCourseRef.current;
      const history = cubitHistoryRef.current.slice(-8);
      const res = await sendCourseChat(course.id, text, { history });
      const reply = res.reply?.trim() || 'Cubit did not send a reply.';
      const nextHistory = [
        ...history,
        { role: 'user' as const, content: text },
        { role: 'assistant' as const, content: reply },
      ];
      patchWindow(windowId, {
        reply,
        courseTitle: course.title,
        history: nextHistory,
        busy: false,
        error: null,
        title: text,
        question: text,
      });
      if (stillHere()) {
        cubitHistoryRef.current = nextHistory;
        setCubitCourseTitle(course.title);
        setCubitReply(reply);
      }
    } catch (err) {
      const message = cubitAskError(err);
      patchWindow(windowId, { error: message, busy: false, draft: text });
      if (stillHere()) {
        setInputValue(text);
        setError(message);
      }
    } finally {
      if (stillHere()) setCubitBusy(false);
    }
  }, [mode]);

  useEffect(() => {
    const question = typeof location.state?.cubitAsk === 'string' ? location.state.cubitAsk.trim() : '';
    if (!signedIn || !question || cubitAskedRef.current) return;
    cubitAskedRef.current = true;
    setMode('cubit');
    void askCubit(question);
  }, [askCubit, location.state, signedIn]);

  const submitInput = (e?: FormEvent) => {
    e?.preventDefault();
    if (!isLearnerStartModeReady(mode)) return;

    const trimmed = inputValue.trim();

    if (!signedIn) {
      openLandingGoogleChooser();
      return;
    }

    if (mode === 'cubit' && isCubitQuestion(trimmed)) {
      void askCubit(trimmed);
      return;
    }

    if (onCourseSubmit && (mode === 'course' || mode === 'cubit')) {
      if (!trimmed) return;
      setError(null);
      onCourseSubmit(trimmed);
      return;
    }

    if (isQuizMode) {
      const isYt = isYoutubePlaylistUrl(trimmed) || isYoutubeVideoUrl(trimmed);
      if (isYt) {
        setError(null);
        if (isYoutubePlaylistUrl(trimmed)) {
          navigate('/playlist-setup/new', { state: { playlistUrl: trimmed } });
          return;
        }
        navigate('/quiz-setup', { state: { youtubeUrl: trimmed } });
        return;
      }

      if (trimmed.length < 8) {
        setError('Describe what you want to be tested on (or paste a YouTube URL).');
        return;
      }
      setError(null);
      navigate('/quiz-setup', {
        state: {
          prompt: trimmed,
          examType: resolveExamType(examType, trimmed),
          startTool: 'quiz' as const,
        },
      });
      return;
    }

    const validationError = getYoutubeUrlValidationError(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    navigate('/course-builder', { state: { youtubeUrl: trimmed, startTool: mode } });
  };

  if (!STUDENT_YOUTUBE_INPUT_ENABLED) return null;

  const modeWindows = chatWindows.filter((window) => window.mode === mode);
  const menuTabs = chatsForMenu(modeWindows, chatsQuery);
  const stripTabs = visibleChatTabs(modeWindows, activeWindowId, CHAT_STRIP_LIMIT);
  const squeezeTabs = stripTabs.length > 4;

  const startTabRow = (placement: 'top' | 'bar') => (
    <div
      className={cn(
        'flex h-8 gap-0.5 overflow-x-auto px-1.5 [scrollbar-width:none]',
        placement === 'top'
          ? 'absolute inset-x-2 top-0 z-0 items-start rounded-t-[14px] border border-b-0 border-[var(--border)] bg-[var(--fill)] pt-1'
          : 'shrink-0 items-center border-t border-[var(--border)] bg-[var(--fill)]',
      )}
      role="tablist"
      aria-label="What do you want to create"
    >
      {LEARNER_START_TABS.map((tab) => {
        const active = mode === tab.id;
        const ready = isLearnerStartModeReady(tab.id);
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={!ready}
            disabled={!ready}
            title={ready ? undefined : 'Coming soon'}
            onClick={() => {
              if (!ready || tab.id === mode) return;
              setMode(tab.id);
            }}
            className="flex h-[18px] shrink-0 items-center rounded-md px-2 text-[10.5px] tracking-[-0.01em] transition-colors disabled:cursor-default disabled:opacity-45"
            style={{
              fontWeight: active ? 600 : 500,
              color: active ? 'var(--ink)' : 'var(--ink-soft)',
              background: active ? 'var(--surface)' : 'transparent',
              boxShadow: active ? 'inset 0 0 0 1px var(--border)' : 'none',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      {isSigningIn && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(8,8,11,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(255,122,26,0.35)', borderTopColor: '#ff7a1a' }}
          />
          <p className="text-sm font-medium text-white/80">Signing you in…</p>
          <p className="text-xs text-white/45">Almost there</p>
        </div>
      )}

      <div className={cn('relative', !lockMode && (fillToBottom ? (greetingVisible ? '-mt-5' : '') : 'pt-5'))}>
        {!lockMode && !fillToBottom ? startTabRow('top') : null}

        {!isNotesMode || anyChatOpen ? (
          <div
            ref={cardRef}
            className={cn(
              'relative z-[1] flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)]',
              chatsMenuOpen ? 'overflow-visible' : 'overflow-hidden',
              'shadow-[var(--shadow)]',
              fillHeight != null && 'transition-[height] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none',
            )}
            style={fillHeight != null ? { height: fillHeight } : undefined}
          >
            {modeChatOpen ? (
              <div className="relative z-20 flex shrink-0 items-stretch rounded-t-2xl border-b border-[var(--border)] bg-[var(--surface)] pl-1 pr-2">
                <div
                  ref={tabListRef}
                  className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none]"
                  role="tablist"
                  aria-label="Open chats"
                >
                  {stripTabs.map((window) => {
                    const selected = window.id === activeWindowId;
                    return (
                      <div
                        key={window.id}
                        role="presentation"
                        className={cn(
                          'group relative flex h-10 min-w-0',
                          squeezeTabs ? 'flex-1' : 'w-[240px] shrink-0',
                        )}
                      >
                        <button
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          title={window.title}
                          onClick={() => selectChatWindow(window.id)}
                          className={cn(
                            'flex h-10 min-w-0 flex-col justify-center rounded-lg pl-3 pr-8 text-left',
                            squeezeTabs ? 'w-full' : 'w-[240px]',
                            !selected && 'hover:bg-[var(--fill)]',
                          )}
                        >
                          <span className={cn('block truncate text-[13px] leading-4 tracking-[-0.01em] text-[var(--ink)]', selected ? 'font-semibold' : 'font-medium')}>
                            {window.title}
                          </span>
                          <span className="block truncate text-[11px] leading-3 text-[var(--ink-faint)]">
                            {formatChatTabTime(window.updatedAt, now)}
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Close ${window.title}`}
                          onClick={() => closeChatWindow(window.id)}
                          className={cn(
                            'absolute right-0 top-0 flex h-10 w-8 items-center justify-center text-[var(--ink-faint)]',
                            selected ? 'flex' : 'hidden group-hover:flex group-focus-within:flex max-md:flex',
                          )}
                        >
                          <X size={14} strokeWidth={2.2} />
                        </button>
                        {selected ? (
                          <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-[var(--accent)]" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div ref={chatsMenuRef} className="relative flex shrink-0 items-center gap-1.5 pl-2">
                  <button
                    type="button"
                    aria-label="All chats"
                    aria-expanded={chatsMenuOpen}
                    aria-haspopup="dialog"
                    onClick={() => {
                      setChatsQuery('');
                      setChatsMenuOpen((open) => !open);
                    }}
                    className="flex h-11 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-[var(--ink)]"
                  >
                    <List size={14} strokeWidth={2.2} />
                    <span className="hidden sm:inline">All chats</span>
                    <span className="rounded-full bg-[var(--accent-soft)] px-1.5 text-[11px] font-semibold text-[var(--accent)]">
                      {modeWindows.length}
                    </span>
                  </button>
                  {chatsMenuOpen ? (
                    <div
                      role="dialog"
                      aria-label="All chats"
                      className="absolute right-0 top-[calc(100%+6px)] z-30 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]"
                    >
                      <div className="flex h-11 items-center gap-2 border-b border-[var(--border)] bg-[var(--fill)] px-3">
                        <Search size={14} strokeWidth={2.2} className="shrink-0 text-[var(--ink-faint)]" />
                        <input
                          ref={chatsSearchRef}
                          value={chatsQuery}
                          onChange={(event) => setChatsQuery(event.target.value)}
                          placeholder="Search chats"
                          aria-label="Search chats"
                          className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)] md:text-[13px]"
                        />
                      </div>
                      <div className="max-h-80 overflow-y-auto py-1">
                        {menuTabs.length === 0 ? (
                          <p className="px-3 py-3 text-[13px] text-[var(--ink-faint)]">No chats</p>
                        ) : menuTabs.map((window) => {
                          const selected = window.id === activeWindowId;
                          return (
                            <button
                              key={window.id}
                              type="button"
                              onClick={() => selectChatWindow(window.id)}
                              className={cn(
                                'flex min-h-11 w-full items-center gap-2 px-3 text-left',
                                selected && 'bg-[var(--fill)]',
                              )}
                            >
                              <span className={cn('size-1.5 shrink-0 rounded-full', selected ? 'bg-[var(--accent)]' : 'bg-transparent')} />
                              <span className={cn('min-w-0 flex-1 truncate text-[13px] text-[var(--ink)]', selected ? 'font-semibold' : 'font-medium')}>
                                {window.title}
                              </span>
                              <span className="shrink-0 text-[12px] text-[var(--ink-faint)]">
                                {formatChatTabTime(window.updatedAt, now)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={openNewChat}
                      aria-label="New chat"
                      className="peer flex size-11 items-center justify-center rounded-lg text-[var(--ink)]"
                    >
                      <Plus size={16} strokeWidth={2.2} />
                    </button>
                    <span className="pointer-events-none absolute right-0 top-full z-30 mt-1 hidden items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--ink)] shadow-[var(--shadow)] md:peer-hover:flex">
                      New chat
                      <kbd className="rounded-md border border-[var(--border)] bg-[var(--fill)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--ink-soft)]">
                        {newChatKeys}
                      </kbd>
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
            <div
              className={cn(
                'grid min-h-0',
                fillHeight != null
                  ? 'min-h-0 flex-1 grid-rows-[1fr]'
                  : cn(
                    'transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none',
                    modeChatOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  ),
              )}
            >
              <div className="min-h-0 overflow-hidden">
                {isNotesMode ? (
                  <div className="h-full min-h-0 overflow-y-auto">
                    <StandaloneNotesWorkspace fill />
                  </div>
                ) : cubitQuestion ? (
                  <div
                    className={cn(
                      'flex flex-col overflow-y-auto border-b border-[var(--border)] px-4 py-3',
                      fillHeight != null ? 'h-full' : 'max-h-80',
                    )}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mt-auto flex flex-col gap-3">
                    <p className="ml-auto max-w-[80%] rounded-[14px] rounded-br border border-[var(--border)] bg-[var(--fill)] px-3.5 py-2.5 text-[14px] leading-5 text-[var(--ink)]">
                      {cubitQuestion}
                    </p>
                    {cubitBusy ? (
                      <p className="self-start font-mono text-[11px] text-[var(--ink-soft)]">Asking Cubit…</p>
                    ) : null}
                    {cubitReply ? (
                      <div className="mr-auto max-w-[80%] self-start">
                        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">Cubit</p>
                        {cubitCourseTitle ? (
                          <p className="mt-1 font-mono text-[10px] text-[var(--ink-faint)]">{cubitCourseTitle}</p>
                        ) : null}
                        <p className="mt-1.5 text-[14px] leading-[22px] text-[var(--ink)]">{cubitReply}</p>
                      </div>
                    ) : null}
                    {error ? (
                      <p className="self-start text-[13px] leading-5 text-[var(--accent)]" role="alert">
                        {error}
                      </p>
                    ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          {fillToBottom && !lockMode ? startTabRow('bar') : null}
          <form
            onSubmit={submitInput}
            className="flex min-h-12 shrink-0 items-center"
          >
            <div className="flex shrink-0 items-center justify-center pl-3 pr-2 text-[var(--ink-faint)]">
              <VideoGlyph />
            </div>

            <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const next = e.target.value;
                  setInputValue(next);
                  if (error) setError(null);
                  if (!examPinned && isQuizMode) {
                    setExamType(inferExamTypeFromText(next));
                  }
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder=" "
                data-testid={inputTestId}
                className="relative z-[1] w-full bg-transparent py-[13px] text-[16px] outline-none md:text-[13px]"
                style={{
                  fontFamily: 'var(--mono)',
                  color: 'var(--ink)',
                  caretColor: 'var(--accent)',
                }}
                aria-label={
                  isQuizMode
                    ? 'Test topic or YouTube URL'
                    : isFlashcardsMode
                      ? 'YouTube URL for flashcards'
                      : 'YouTube URL to create a course'
                }
                autoComplete="off"
                // Never use inputMode=url — iOS URL keyboard has no space bar (blocks prompt text).
                inputMode="text"
                enterKeyHint="go"
              />
              {showTypewriter && (
                <div className="pointer-events-none absolute inset-y-0 left-0 z-0 flex items-center gap-0.5 overflow-hidden whitespace-nowrap" aria-hidden>
                  <span className="truncate text-[13px] text-[var(--ink-faint)]" style={{ fontFamily: 'var(--mono)' }}>{phText}</span>
                  <span className="inline-block h-[13px] w-[1.5px] shrink-0 animate-pulse bg-[var(--ink-faint)] motion-reduce:hidden" />
                </div>
              )}
            </div>

            {isQuizMode ? (
              <div className="mr-1 flex shrink-0 items-center gap-0.5">
                {EXAM_TYPES.map((opt) => {
                  const active = examType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setExamType(opt.id);
                        setExamPinned(true);
                      }}
                      className="flex h-6 shrink-0 items-center rounded-full px-2 text-[10px] transition-colors"
                      style={{
                        fontWeight: active ? 700 : 600,
                        color: active ? 'var(--accent)' : 'var(--ink-soft)',
                        background: 'transparent',
                        border: active ? '1px solid var(--accent)' : '1px solid transparent',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {STUDENT_UPLOAD_ENABLED && (
              <>
                <div className="h-[22px] w-px shrink-0 bg-[var(--border)]" aria-hidden />
                <button
                  type="button"
                  title="Upload"
                  onClick={() => fileRef.current?.click()}
                  className="flex size-11 shrink-0 items-center justify-center text-[var(--ink-faint)] transition-colors hover:bg-[var(--border)] hover:text-[var(--ink)]"
                >
                  <Upload size={16} strokeWidth={1.8} />
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*,audio/*,video/*,.pdf,.txt,.md" />
              </>
            )}

            {/*
              Landing guests: keep the same black arrow visually, but place the real Google
              Sign-In control on top so the click opens the same account-chooser page.
            */}
            <div className="relative mx-1.5 size-[34px] shrink-0 sm:size-[34px]">
              <div
                className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center rounded-full bg-[var(--ink)] text-[var(--bg)]"
                aria-hidden
              >
                <ArrowRight size={15} strokeWidth={2.2} />
              </div>
              {!signedIn ? (
                <div
                  className="absolute inset-0 z-10 overflow-hidden rounded-full opacity-[0.02] [&_div]:!h-full [&_div]:!w-full [&_iframe]:!h-full [&_iframe]:!min-h-0 [&_iframe]:!w-full"
                  onMouseDown={() => {
                    rememberGuestPending();
                  }}
                  title="Continue with Google"
                >
                  <GoogleLogin
                    onSuccess={(cred) => {
                      void finishGoogleCredential(cred);
                    }}
                    onError={() => setError('Google sign-in was cancelled or failed.')}
                    type="icon"
                    theme={isDark ? 'filled_black' : 'outline'}
                    size="large"
                    shape="circle"
                    text="continue_with"
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  data-testid={submitTestId}
                  className="absolute inset-0 z-10 rounded-full"
                  aria-label={
                    mode === 'cubit'
                      ? 'Ask Cubit'
                      : isQuizMode
                        ? 'Start quiz'
                        : isFlashcardsMode
                          ? 'Create flashcards'
                          : 'Create course'
                  }
                />
              )}
            </div>
          </form>
          </div>
        ) : null}

        {isNotesMode && !anyChatOpen ? <StandaloneNotesWorkspace /> : null}
      </div>

      {!error && isNotesMode && !anyChatOpen && (
        <p className="mt-2 text-[11px] leading-snug text-[var(--ink-faint)]">
          Tap My notes for your library. Pick a note on the right to open it here. Drafts save on this device.
        </p>
      )}

      {!error && !modeChatOpen && !isQuizMode && !isNotesMode && (
        <p className="mt-2 text-[11px] leading-snug text-[var(--ink-faint)]">
          {signedIn
            ? isFlashcardsMode
              ? 'Paste a YouTube video or playlist URL, then tap to make flashcards.'
              : 'Paste a YouTube video or playlist URL, then tap Create.'
            : 'Paste a YouTube URL or tap the arrow to choose a Google account.'}
        </p>
      )}

      {error && !modeChatOpen && (
        <p className="mt-2 text-xs text-[var(--accent)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
