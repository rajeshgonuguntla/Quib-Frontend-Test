import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useUserProfile } from '../../context/UserProfileContext';
import { useRequireStudioV2 } from '../../hooks/useRequireStudioV2';
import '../../styles/studio.css';
import { ChatPane } from './chat/ChatPane';
import { EmptyState } from './chat/EmptyState';
import {
  detectLink,
  findCourseRow,
  isSeededCourse,
  playlist,
  seededCourse,
  seededMessages,
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

function draftFor(url: string): StudioChatMessage[] {
  const kind = detectLink(url);
  const user = { id: `user-${Date.now()}`, role: 'user' as const, text: url };
  if (kind === 'invalid') {
    return [user, {
      id: `ai-${Date.now()}`,
      role: 'ai',
      text: "Paste a YouTube video, playlist, web page or PDF link and I'll turn it into a course.",
    }];
  }
  const text = kind === 'playlist'
    ? 'Found a YouTube playlist with 8 videos. Pick the videos, check the title and description, then generate.'
    : `Found a ${kind === 'video' ? 'YouTube video' : kind}. The full sample course is SAT Math Sprint.`;
  return [user, { id: `ai-${Date.now()}`, role: 'ai', text, card: { type: 'source', kind } }];
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

export function StudioPage() {
  useRequireStudioV2();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const userId = profile?.id;
  const isEmpty = !courseId;
  const seeded = isSeededCourse(courseId);
  const course = useMemo(() => {
    if (seeded) return seededCourse;
    if (!courseId) return null;
    return sparseCourse(findCourseRow(courseId)?.title || 'Course');
  }, [courseId, seeded]);
  const [messages, setMessages] = useState<StudioChatMessage[]>(seeded ? seededMessages : []);
  const [draft, setDraft] = useState<StudioChatMessage[] | null>(null);
  const [refs, setRefs] = useState<ItemRef[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (isSeededCourse(courseId)) {
      setMessages(seededMessages);
    } else if (courseId) {
      const title = findCourseRow(courseId)?.title || 'Course';
      setMessages([{
        id: 'sample-open',
        role: 'ai',
        text: `${title} is a static sample. Open SAT Math Sprint for the full chat and outline.`,
      }]);
    } else {
      setMessages([]);
    }
    setDraft(null);
    setRefs([]);
    setPreviewOpen(false);
  }, [courseId]);

  useEffect(() => {
    if (!userId) return;
    setCollapsed(readChatCollapsed(userId));
    setHydrated(true);
  }, [userId]);

  const persist = useCallback((next: boolean) => {
    setCollapsed(next);
    if (userId) writeChatCollapsed(userId, next);
  }, [userId]);

  const send = (text: string) => {
    const user: StudioChatMessage = { id: `user-${Date.now()}`, role: 'user', text, refs: refs.length ? refs : undefined };
    setRefs([]);
    setMessages((current) => [...current, user, replyFor(text)]);
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
        preview={course ? (
          <PreviewPane course={course} onMention={mention} onFix={(item) => send(`Fix with AI: ${item.title}`)} onClose={() => setPreviewOpen(false)} />
        ) : undefined}
      >
        {isEmpty && !draft ? <EmptyState onSubmit={(url) => setDraft(draftFor(url || playlist.url))} /> : null}
        {isEmpty && draft ? (
          <ChatPane
            messages={draft}
            placeholder="Paste a YouTube video, playlist, web page or PDF link"
            onSend={(text) => setDraft(draftFor(text))}
            onGenerate={() => navigate('/educator-studio/sat-math-sprint')}
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
          />
        ) : null}
      </StudioLayout>
    </div>
  );
}
