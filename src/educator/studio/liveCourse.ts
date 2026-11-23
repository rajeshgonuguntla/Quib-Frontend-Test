import axios from 'axios';
import type { GeneratedCoursePayload } from '../../api/educatorApi';
import { DEFAULT_GENERATION_OPTIONS, type CourseGenerationOptions, type CourseLesson, type CourseModule, type CourseUpdatePayload } from '../../types/courseGeneration';
import { detectLink, type ItemRef, type NotePoint, type StudioChatMessage, type StudioCourse, type StudioItem } from './model';

export function generationBody(url: string, title: string, description: string): {
  youtubeUrl: string;
  options: CourseGenerationOptions;
} {
  const notes = [
    title.trim() ? `Title: ${title.trim()}` : '',
    description.trim() ? `Description: ${description.trim()}` : '',
  ].filter(Boolean);
  return {
    youtubeUrl: url.trim(),
    options: {
      ...DEFAULT_GENERATION_OPTIONS,
      ...(notes.length ? { builderNotes: notes.join('\n') } : {}),
    },
  };
}

export function draftThread(url: string, now = Date.now()): StudioChatMessage[] {
  const kind = detectLink(url);
  const user: StudioChatMessage = { id: `user-${now}`, role: 'user', text: url };
  if (kind === 'invalid') {
    return [user, {
      id: `ai-${now}`,
      role: 'ai',
      text: "Paste a YouTube video, playlist, web page or PDF link and I'll turn it into a course.",
    }];
  }
  if (kind === 'web' || kind === 'pdf') {
    return [user, {
      id: `ai-${now}`,
      role: 'ai',
      text: 'Only a YouTube video or playlist can be turned into a course today.',
    }];
  }
  const label = kind === 'playlist' ? 'YouTube playlist' : 'YouTube video';
  return [user, {
    id: `ai-${now}`,
    role: 'ai',
    text: `Found a ${label}. Add a title if you want one, then generate. Cubit builds the lessons from this link.`,
    card: { type: 'source', kind, url: url.trim(), live: true },
  }];
}

export function assistantText(text: string, refs: ItemRef[]) {
  const body = text.trim();
  if (!refs.length) return body;
  return `${refs.map((ref) => `@${ref.label}`).join(' ')} ${body}`;
}

export function apiError(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; details?: string } | undefined;
    if (err.response?.status === 429) return 'Too many requests. Wait a minute and try again.';
    return data?.message || data?.details || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

function notePoints(lesson: CourseLesson): NotePoint[] {
  const points: NotePoint[] = [];
  if (lesson.notes?.trim()) {
    lesson.notes.split(/\n+/).filter(Boolean).forEach((line, index) => {
      points.push({ at: String(index + 1).padStart(2, '0'), text: line.trim() });
    });
  } else if (lesson.summary?.trim()) {
    points.push({ at: '01', text: lesson.summary.trim() });
  }
  for (const concept of lesson.keyConcepts ?? []) {
    if (concept.trim()) points.push({ at: '', text: concept.trim() });
  }
  if (lesson.takeaway?.trim()) points.push({ at: '', text: lesson.takeaway.trim() });
  return points;
}

function lessonItem(moduleId: string, lesson: CourseLesson, index: number): StudioItem {
  const points = notePoints(lesson);
  const video = lesson.type !== 'reading';
  const id = lesson.id || `${moduleId}-lesson-${index + 1}`;
  return {
    id,
    kind: video ? 'video' : (points.length ? 'notes' : 'reading'),
    moduleId,
    title: lesson.title || 'Lesson',
    meta: lesson.duration || 'Lesson',
    content: video
      ? { kind: 'video', duration: lesson.duration || '', notes: points }
      : { kind: points.length ? 'notes' : 'reading', points },
  };
}

function studyItems(moduleId: string, lesson: CourseLesson, index: number): StudioItem[] {
  const id = lesson.id || `${moduleId}-lesson-${index + 1}`;
  const items: StudioItem[] = [];
  if (lesson.flashcards?.length) {
    items.push({
      id: `${id}-cards`,
      kind: 'cards',
      moduleId,
      title: `${lesson.title || 'Lesson'} cards`,
      meta: `${lesson.flashcards.length} cards`,
      content: { kind: 'cards', cards: lesson.flashcards },
    });
  }
  if (lesson.blanks?.length) {
    items.push({
      id: `${id}-blanks`,
      kind: 'blanks',
      moduleId,
      title: `${lesson.title || 'Lesson'} blanks`,
      meta: `${lesson.blanks.length} blanks`,
      content: {
        kind: 'blanks',
        blanks: lesson.blanks.map((blank) => ({
          sentence: blank.sentence.includes('{') || !blank.answer
            ? blank.sentence
            : `${blank.sentence} {${blank.answer}}`,
        })),
      },
    });
  }
  return items;
}

function moduleItems(module: CourseModule, moduleId: string): StudioItem[] {
  const lessons = module.lessons ?? [];
  const items = lessons.flatMap((lesson, index) => [
    lessonItem(moduleId, lesson, index),
    ...studyItems(moduleId, lesson, index),
  ]);
  if (module.quiz?.length) {
    const shown = module.quiz.slice(0, 5);
    items.push({
      id: `${moduleId}-quiz`,
      kind: 'drill',
      moduleId,
      title: 'Questions',
      meta: `${module.quiz.length} questions`,
      content: {
        kind: 'drill',
        questions: shown.map((question, index) => ({
          id: `${moduleId}-q${index + 1}`,
          n: index + 1,
          prompt: question.question,
          format: 'multiple choice',
        })),
        moreCount: Math.max(0, module.quiz.length - shown.length),
      },
    });
  }
  if (items.length === 0) {
    items.push({
      id: `${moduleId}-overview`,
      kind: 'notes',
      moduleId,
      title: module.title || 'Module',
      meta: 'Lesson',
      content: {
        kind: 'notes',
        points: module.description ? [{ at: '', text: module.description }] : [],
      },
    });
  }
  return items;
}

export function mapGeneratedCourse(data: GeneratedCoursePayload, fallbackId: string): StudioCourse {
  const modules = (data.modules ?? []).map((module, index) => {
    const id = module.id || `m${index + 1}`;
    return {
      id,
      name: module.title || `Module ${index + 1}`,
      items: moduleItems(module, id),
    };
  });
  return {
    id: data.courseId || fallbackId,
    title: data.title || 'Course',
    description: data.description || '',
    slug: data.publicSlug || fallbackId,
    status: data.isPublished ? 'published' : 'draft',
    visibility: data.isPublished ? 'public' : 'private',
    modules: modules.length ? modules : [{
      id: 'm1',
      name: 'Course',
      items: [{
        id: `${fallbackId}-overview`,
        kind: 'notes',
        moduleId: 'm1',
        title: data.title || 'Course',
        meta: 'Lesson',
        content: { kind: 'notes', points: data.description ? [{ at: '', text: data.description }] : [] },
      }],
    }],
  };
}

export function editCard(messageId: string, update: CourseUpdatePayload): StudioChatMessage['card'] {
  const title = update.title?.trim();
  return {
    type: 'diff',
    title: 'Suggested edit',
    ops: [{
      id: messageId,
      status: 'pending',
      summary: title ? `Update the course, including the title <b>${title}</b>.` : 'Apply this edit to the course.',
      op: { type: 'course_update' },
    }],
  };
}
