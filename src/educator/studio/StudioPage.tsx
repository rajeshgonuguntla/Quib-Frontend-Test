import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { fetchCourse, generateCourse, updateCourse, type GeneratedCoursePayload } from '../../api/educatorApi';
import { CoursePlayer, type Course } from '../../components/CourseDetails';
import { sendEducatorAssistantMessage } from '../../api/educatorAssistantApi';
import { useUserProfile } from '../../context/UserProfileContext';
import { useRequireStudioV2 } from '../../hooks/useRequireStudioV2';
import type { CourseUpdatePayload, EditableCourse } from '../../types/courseGeneration';
import '../../styles/studio.css';
import { ChatPane } from './chat/ChatPane';
import { EmptyState } from './chat/EmptyState';
import {
  apiError,
  assistantText,
  describeCourseEdit,
  draftThread,
  editCard,
  generationBody,
  mapGeneratedCourse,
  proposedEdit,
  toEditableCourse,
} from './liveCourse';
import {
  findCourseRow,
  isLiveStudioCourse,
  isSeededCourse,
  seededCourse,
  seededMessages,
  type DiffOp,
  type ItemRef,
  type StudioCard,
  type StudioChatMessage,
  type StudioCourse,
  type StudioItem,
} from './model';
import { PreviewPane } from './preview/PreviewPane';
import { StudioLayout } from './StudioLayout';
import { StudioTopBar } from './StudioTopBar';
import { readChatCollapsed, writeChatCollapsed } from './useChatCollapsed';

function settingsCard(publish: boolean): StudioCard {
  return {
    type: 'settings',
    title: seededCourse.title,
    description: seededCourse.description,
    slug: seededCourse.slug,
    visibility: publish ? 'public' : 'private',
    publish,
    show: ['access', 'publish'],
    status: 'pending',
  };
}

function replyFor(text: string): StudioChatMessage {
  const id = `ai-${Date.now()}`;
  if (/fix with ai/i.test(text)) {
    return {
      id,
      role: 'ai',
      text: 'Here is one change for Heart of algebra. Nothing is saved until you accept.',
      card: {
        type: 'diff',
        title: 'Fix with AI',
        ops: [{
          id: `${id}-op`,
          status: 'pending',
          summary: 'Rewrite notes for <b>Linear equations in 12 minutes</b>',
          op: {
            type: 'update_notes',
            notes: [
              { at: '01:05', text: 'y = mx + b. m is the slope. b is the y-intercept.' },
              { at: '05:40', text: 'Undo each step on both sides.' },
            ],
          },
        }],
      },
    };
  }
  if (/settings/i.test(text)) {
    return { id, role: 'ai', text: 'Check these settings and confirm.', card: settingsCard(false) };
  }
  if (/publish/i.test(text)) {
    return { id, role: 'ai', text: 'Check these settings and confirm.', card: settingsCard(true) };
  }
  return {
    id,
    role: 'ai',
    text: 'This preview is static. The outline is on the right. Ask for Fix with AI, settings, or publish to open those cards.',
  };
}

function playerCourse(data: GeneratedCoursePayload): Course {
  return {
    title: data.title || 'Course',
    description: data.description ?? '',
    difficulty: data.difficulty || 'Intermediate',
    date: '',
    modules: (data.modules ?? []).map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description ?? '',
      lessons: module.lessons ?? [],
      quiz: module.quiz ?? [],
    })),
    playlistUrl: data.playlistUrl,
    playlistVideos: data.playlistVideos,
  };
}

function sparseCourse(title: string): StudioCourse {
  return {
    id: 'sample',
    title,
    description: '',
    slug: 'sample',
    status: 'draft',
    visibility: 'private',
    modules: [{
      id: 'm1',
      name: 'Sample',
      items: [{
        id: 'sample-1',
        kind: 'notes',
        moduleId: 'm1',
        title: 'Static sample',
        meta: '1 note',
        content: {
          kind: 'notes',
          points: [{ at: '00:00', text: 'Open SAT Math Sprint to see the full outline, notes, drills, cards and mock test.' }],
        },
      }],
    }],
  };
}

function withOpStatus(current: StudioChatMessage[], opId: string, status: DiffOp['status']) {
  return current.map((message) => {
    if (message.card?.type !== 'diff') return message;
    return {
      ...message,
      card: {
        ...message.card,
        ops: message.card.ops.map((op) => (op.id === opId ? { ...op, status } : op)),
      },
    };
  });
}

export function StudioPage() {
  useRequireStudioV2();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const userId = profile?.id;
  const isEmpty = !courseId;
  const seeded = isSeededCourse(courseId);
  const live = isLiveStudioCourse(courseId);
  const [liveCourse, setLiveCourse] = useState<StudioCourse | null>(null);
  const [livePayload, setLivePayload] = useState<GeneratedCoursePayload | null>(null);
  const [messages, setMessages] = useState<StudioChatMessage[]>(seeded ? seededMessages : []);
  const [draft, setDraft] = useState<StudioChatMessage[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refs, setRefs] = useState<ItemRef[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const updates = useRef(new Map<string, CourseUpdatePayload>());
  const savedCourse = useRef<EditableCourse | null>(null);
  const sessionRef = useRef<string | undefined>(undefined);
  const revisionRef = useRef<string | undefined>(undefined);
  const savingRef = useRef(false);
  const chattingRef = useRef(false);
  const generatingRef = useRef(false);

  const course = useMemo(() => {
    if (seeded) return seededCourse;
    if (liveCourse) return liveCourse;
    if (!courseId || live) return null;
    return sparseCourse(findCourseRow(courseId)?.title || 'Course');
  }, [courseId, seeded, live, liveCourse]);

  useEffect(() => {
    setDraft(null);
    setGenerating(false);
    setRefs([]);
    setPreviewOpen(false);
    updates.current.clear();
    savedCourse.current = null;
    sessionRef.current = undefined;
    revisionRef.current = undefined;
    savingRef.current = false;
    chattingRef.current = false;
    generatingRef.current = false;
    if (seeded) {
      setLiveCourse(null);
      setLivePayload(null);
      setMessages(seededMessages);
      return;
    }
    if (!courseId) {
      setLiveCourse(null);
      setLivePayload(null);
      setMessages([]);
      return;
    }
    if (!live) {
      setLiveCourse(null);
      setLivePayload(null);
      const title = findCourseRow(courseId)?.title || 'Course';
      setMessages([{
        id: 'sample-open',
        role: 'ai',
        text: `${title} is a static sample. Open SAT Math Sprint for the full chat and outline.`,
      }]);
      return;
    }
    let cancelled = false;
    setLiveCourse(null);
    setLivePayload(null);
    setMessages([{ id: 'loading', role: 'ai', text: 'Loading the course…', pending: true }]);
    void fetchCourse(courseId).then((data) => {
      if (cancelled) return;
      savedCourse.current = toEditableCourse(data);
      setLivePayload({ ...data, courseId });
      setLiveCourse(mapGeneratedCourse(data, courseId));
      setMessages([{
        id: 'ready',
        role: 'ai',
        text: 'The course is on the right. Ask Cubit AI to change it.',
      }]);
    }).catch((err: unknown) => {
      if (cancelled) return;
      setMessages([{ id: 'load-error', role: 'ai', text: apiError(err, 'Could not load this course.') }]);
    });
    return () => { cancelled = true; };
  }, [courseId, seeded, live]);

  useEffect(() => {
    if (!userId) return;
    setCollapsed(readChatCollapsed(userId));
    setHydrated(true);
  }, [userId]);

  const persist = useCallback((next: boolean) => {
    setCollapsed(next);
    if (userId) writeChatCollapsed(userId, next);
  }, [userId]);

  const sendLive = async (text: string) => {
    if (!courseId || chattingRef.current) return;
    chattingRef.current = true;
    const mentionRefs = refs;
    const user: StudioChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      refs: mentionRefs.length ? mentionRefs : undefined,
    };
    const pendingId = `ai-${Date.now()}`;
    setRefs([]);
    setMessages((current) => [...current, user, { id: pendingId, role: 'ai', text: 'Thinking…', pending: true }]);
    try {
      const res = await sendEducatorAssistantMessage(courseId, {
        message: assistantText(text, mentionRefs, course),
        ...(sessionRef.current ? { sessionId: sessionRef.current } : {}),
        ...(revisionRef.current ? { courseRevision: revisionRef.current } : {}),
      });
      if (res.sessionId) sessionRef.current = res.sessionId;
      if (res.courseRevision) revisionRef.current = res.courseRevision;
      const update = res.hasCourseChanges ? res.courseUpdate : null;
      const operations = res.hasCourseChanges ? (res.operations ?? null) : null;
      const base = savedCourse.current;
      const payload = proposedEdit(base, update, operations);
      if (payload) {
        updates.current.set(pendingId, payload);
        setLivePayload((current) => ({
          ...current,
          ...payload,
          courseId,
          playlistUrl: current?.playlistUrl,
          playlistVideos: current?.playlistVideos,
        }));
        setLiveCourse(mapGeneratedCourse(payload, courseId));
      }
      setMessages((current) => current.map((message) => (message.id === pendingId ? {
        id: pendingId,
        role: 'ai',
        text: res.reply || 'Done.',
        card: payload ? editCard(pendingId, describeCourseEdit(base, payload)) : undefined,
      } : message)));
    } catch (err) {
      setMessages((current) => current.map((message) => (message.id === pendingId ? {
        id: pendingId,
        role: 'ai',
        text: apiError(err, 'Cubit AI could not answer that.'),
      } : message)));
    } finally {
      chattingRef.current = false;
    }
  };

  const send = (text: string) => {
    if (live) {
      void sendLive(text);
      return;
    }
    const user: StudioChatMessage = { id: `user-${Date.now()}`, role: 'user', text, refs: refs.length ? refs : undefined };
    setRefs([]);
    setMessages((current) => [...current, user, replyFor(text)]);
  };

  const generate = async (fields: { title: string; description: string }) => {
    const source = draft?.find((message) => message.card?.type === 'source' && message.card.url);
    const url = source?.card?.type === 'source' ? source.card.url : '';
    if (!url || generatingRef.current) return;
    generatingRef.current = true;
    const pendingId = `ai-gen-${Date.now()}`;
    const body = generationBody(url, fields.title, fields.description);
    setGenerating(true);
    setDraft((current) => (current ? [...current, { id: pendingId, role: 'ai', text: 'Building the course…', pending: true }] : current));
    try {
      const data = await generateCourse(body.youtubeUrl, body.options);
      if (!data.courseId) throw new Error('The course was created without an id.');
      navigate(`/educator-studio/${data.courseId}`);
    } catch (err) {
      generatingRef.current = false;
      setGenerating(false);
      setDraft((current) => current?.map((message) => (message.id === pendingId ? {
        id: pendingId,
        role: 'ai',
        text: apiError(err, 'Unable to generate the course.'),
      } : message)) ?? current);
    }
  };

  const resolve = (opId: string, status: DiffOp['status']) => {
    if (!live) return;
    if (status === 'rejected') {
      updates.current.delete(opId);
      if (savedCourse.current && courseId) {
        setLivePayload((current) => ({
          ...savedCourse.current,
          courseId,
          playlistUrl: current?.playlistUrl,
          playlistVideos: current?.playlistVideos,
        }));
        setLiveCourse(mapGeneratedCourse(savedCourse.current, courseId));
      }
      setMessages((current) => withOpStatus(current, opId, 'rejected'));
      return;
    }
    const update = updates.current.get(opId);
    if (!update || !courseId || savingRef.current) return;
    savingRef.current = true;
    void (async () => {
      try {
        await updateCourse(courseId, update);
        const fresh = await fetchCourse(courseId);
        savedCourse.current = toEditableCourse(fresh);
        setLivePayload({ ...fresh, courseId });
        setLiveCourse(mapGeneratedCourse(fresh, courseId));
        setMessages((current) => withOpStatus(current, opId, 'accepted'));
      } catch (err) {
        setMessages((current) => [...current, {
          id: `ai-save-${Date.now()}`,
          role: 'ai',
          text: apiError(err, 'Could not save that edit.'),
        }]);
      } finally {
        savingRef.current = false;
      }
    })();
  };

  const mention = (item: StudioItem) => {
    setRefs((current) => (current.some((ref) => ref.id === item.id) ? current.filter((ref) => ref.id !== item.id) : [...current, { id: item.id, label: item.title }]));
  };

  const title = isEmpty ? 'New course' : course?.title || 'New course';
  const published = Boolean(course && course.status === 'published');

  return (
    <div data-testid="studio" className="studio">
      <StudioTopBar title={title} published={published} onPreview={() => setPreviewOpen(true)} />
      <StudioLayout
        isEmpty={isEmpty}
        drafting={Boolean(draft)}
        previewOpen={previewOpen}
        collapsed={collapsed}
        showToggle={!isEmpty && hydrated}
        onToggle={() => persist(!collapsed)}
        onExpand={() => persist(false)}
        previewClassName={live && livePayload ? 'is-player' : undefined}
        preview={live && livePayload && courseId ? (
          <CoursePlayer course={playerCourse(livePayload)} courseId={courseId} youtubeUrl={livePayload.playlistUrl ?? ''} />
        ) : course ? (
          <PreviewPane course={course} onMention={mention} onFix={(item) => send(`Fix with AI: ${item.title}`)} onClose={() => setPreviewOpen(false)} />
        ) : undefined}
      >
        {isEmpty && !draft ? <EmptyState onSubmit={(url) => setDraft(draftThread(url))} /> : null}
        {isEmpty && draft ? (
          <ChatPane
            messages={draft}
            busy={generating}
            placeholder="Paste a YouTube video, playlist, web page or PDF link"
            onSend={(text) => {
              if (!generating) setDraft(draftThread(text));
            }}
            onGenerate={(fields) => { void generate(fields); }}
          />
        ) : null}
        {!isEmpty ? (
          <ChatPane
            messages={messages}
            refs={refs}
            onRemoveRef={(id) => setRefs((current) => current.filter((ref) => ref.id !== id))}
            placeholder="Ask Cubit AI to change the course…"
            showQuick
            onSend={send}
            onResolve={live ? resolve : undefined}
          />
        ) : null}
      </StudioLayout>
    </div>
  );
}
