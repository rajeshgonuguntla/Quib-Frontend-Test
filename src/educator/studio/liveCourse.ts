import axios from 'axios';
import type { GeneratedCoursePayload } from '../../api/educatorApi';
import { DEFAULT_GENERATION_OPTIONS, type CourseEditOperation, type CourseGenerationOptions, type CourseLesson, type CourseModule, type CourseUpdatePayload, type EditableCourse } from '../../types/courseGeneration';
import { buildSavePayloadFromAssistant } from '../../utils/courseEditOperations';
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

export function assistantText(text: string, refs: ItemRef[], course?: StudioCourse | null) {
  const body = text.trim();
  if (!refs.length) return body;
  const mentions = refs.map((ref) => `@${ref.label}`).join(' ');
  if (!course || /\b(?:module|lesson)\s+\d+/i.test(body)) return `${mentions} ${body}`;
  const locators = refs.map((ref) => locateRef(course, ref)).filter((line) => line.length > 0);
  if (!locators.length) return `${mentions} ${body}`;
  return `${locators.join('; ')}. ${body}`;
}

function locateRef(course: StudioCourse, ref: ItemRef) {
  for (let index = 0; index < course.modules.length; index += 1) {
    const module = course.modules[index];
    const moduleNo = index + 1;
    if (ref.id === `${module.id}-quiz`) return `module ${moduleNo} quiz (module id ${module.id})`;
    if (module.id === ref.id) return `module ${moduleNo} (id ${module.id})`;
    const item = module.items.find((entry) => entry.id === ref.id);
    if (!item) continue;
    if (item.kind === 'drill') return `module ${moduleNo} quiz (module id ${module.id})`;
    const lessonId = item.id.replace(/-(?:cards|blanks)$/, '');
    const lessons = module.items.filter((entry) => entry.kind === 'video' || entry.kind === 'reading' || entry.kind === 'notes');
    const lessonNo = Math.max(1, lessons.findIndex((entry) => entry.id === lessonId) + 1);
    const focus = item.kind === 'cards' ? ' flashcards' : item.kind === 'blanks' ? ' blanks' : '';
    return `lesson ${lessonNo} in module ${moduleNo}${focus} (lesson id ${lessonId})`;
  }
  return '';
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

/** Same id the learner course player embeds: lesson video, then its URL, then the course link. */
export function youtubeEmbedId(videoId?: string, videoUrl?: string, fallbackUrl?: string): string {
  if (videoId?.trim()) return videoId.trim();
  for (const url of [videoUrl, fallbackUrl]) {
    if (!url) continue;
    const watch = url.match(/[?&]v=([^&#]+)/);
    const short = url.match(/youtu\.be\/([^?&#]+)/);
    const embed = url.match(/youtube\.com\/embed\/([^?&#]+)/);
    const id = watch?.[1] || short?.[1] || embed?.[1];
    if (id) return id;
  }
  return '';
}

function lessonVideoId(lesson: CourseLesson, data: GeneratedCoursePayload): string {
  const direct = youtubeEmbedId(lesson.videoId, lesson.videoUrl, data.playlistUrl);
  if (direct) return direct;
  const lessonTitle = (lesson.title || '').trim();
  const titled = (data.playlistVideos ?? []).find((video) => video.title?.trim() && video.title.trim() === lessonTitle);
  return titled ? youtubeEmbedId(titled.videoId, titled.videoUrl) : '';
}

function lessonItem(moduleId: string, lesson: CourseLesson, index: number, data: GeneratedCoursePayload): StudioItem {
  const points = notePoints(lesson);
  const video = lesson.type !== 'reading';
  const id = lesson.id || `${moduleId}-lesson-${index + 1}`;
  const embedId = video ? lessonVideoId(lesson, data) : '';
  return {
    id,
    kind: video ? 'video' : (points.length ? 'notes' : 'reading'),
    moduleId,
    title: lesson.title || 'Lesson',
    meta: lesson.duration || 'Lesson',
    content: video
      ? { kind: 'video', duration: lesson.duration || '', videoId: embedId || undefined, notes: points }
      : { kind: points.length ? 'notes' : 'reading', points },
  };
}

function moduleItems(module: CourseModule, moduleId: string, data: GeneratedCoursePayload): StudioItem[] {
  const lessons = module.lessons ?? [];
  const items = lessons.map((lesson, index) => lessonItem(moduleId, lesson, index, data));
  if (module.quiz?.length) {
    const shown = module.quiz.slice(0, 5);
    items.push({
      id: `${moduleId}-quiz`,
      kind: 'drill',
      moduleId,
      title: 'Module quiz',
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
      items: moduleItems(module, id, data),
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

export function toEditableCourse(data: GeneratedCoursePayload): EditableCourse {
  return {
    title: data.title ?? '',
    description: data.description ?? '',
    difficulty: data.difficulty ?? 'Intermediate',
    category: data.category,
    contentLanguage: data.contentLanguage,
    modules: data.modules ?? [],
    playlistVideos: data.playlistVideos,
  };
}

function courseSnapshot(course: Pick<EditableCourse, 'title' | 'description' | 'difficulty' | 'category' | 'contentLanguage' | 'modules'>) {
  return JSON.stringify({
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    category: course.category,
    contentLanguage: course.contentLanguage,
    modules: course.modules,
  });
}

function replacement<T>(next: object, key: string, previous: T): T {
  if (!(key in next)) return previous;
  const value = (next as Record<string, unknown>)[key];
  if (value == null) return previous;
  return value as T;
}

function mergeLesson(previous: CourseLesson | undefined, next: CourseLesson): CourseLesson {
  if (!previous) return next;
  return {
    ...previous,
    ...next,
    summary: replacement(next, 'summary', previous.summary),
    notes: replacement(next, 'notes', previous.notes),
    takeaway: replacement(next, 'takeaway', previous.takeaway),
    keyConcepts: replacement(next, 'keyConcepts', previous.keyConcepts),
    flashcards: replacement(next, 'flashcards', previous.flashcards),
    blanks: replacement(next, 'blanks', previous.blanks),
  };
}

function mergeModule(previous: CourseModule | undefined, next: CourseModule): CourseModule {
  if (!previous) return next;
  const lessons = next.lessons?.length
    ? next.lessons.map((lesson) => mergeLesson(previous.lessons.find((item) => item.id === lesson.id), lesson))
    : previous.lessons;
  return {
    ...previous,
    ...next,
    description: replacement(next, 'description', previous.description),
    lessons,
    quiz: replacement(next, 'quiz', previous.quiz),
  };
}

/** Keep the assistant's course, including quiz, flashcards, and added or removed lessons. */
function mergeReturnedCourse(base: EditableCourse, update: CourseUpdatePayload): CourseUpdatePayload {
  const merged: EditableCourse = {
    ...base,
    title: update.title?.trim() ? update.title : base.title,
    description: update.description ?? base.description,
    difficulty: update.difficulty ?? base.difficulty,
    category: update.category ?? base.category,
    contentLanguage: update.contentLanguage ?? base.contentLanguage,
    modules: update.modules?.length
      ? update.modules.map((module) => mergeModule(base.modules.find((item) => item.id === module.id), module))
      : base.modules,
  };
  const { playlistVideos: _videos, ...payload } = merged;
  return {
    ...payload,
    includedVideoIds: update.includedVideoIds?.length ? update.includedVideoIds : [],
  };
}

/** The assistant's courseUpdate is the edited course. Operations are only a fallback. */
export function proposedEdit(
  base: EditableCourse | null,
  update: CourseUpdatePayload | null,
  operations?: CourseEditOperation[] | null,
): CourseUpdatePayload | null {
  const source = base ?? (update ? toEditableCourse(update) : null);
  if (!source) return null;
  const payload = update?.modules?.length
    ? mergeReturnedCourse(source, update)
    : operations?.length
      ? buildSavePayloadFromAssistant(source, { operations })
      : null;
  if (!payload || (base && courseSnapshot(base) === courseSnapshot(payload))) return null;
  return payload;
}

export function describeCourseEdit(
  before: Pick<EditableCourse, 'title' | 'modules'> | EditableCourse | null,
  after: Pick<EditableCourse, 'title' | 'modules'> | EditableCourse | null,
): string {
  if (!before || !after) return 'Apply this edit to the course.';
  const bits: string[] = [];
  if (before.title.trim() !== after.title.trim()) bits.push(`Rename the course to <b>${after.title}</b>.`);
  const beforeIds = before.modules.map((module) => module.id);
  const afterIds = after.modules.map((module) => module.id);
  for (const module of after.modules) {
    if (!beforeIds.includes(module.id)) bits.push(`Add the module <b>${module.title}</b>.`);
  }
  for (const module of before.modules) {
    if (!afterIds.includes(module.id)) bits.push(`Remove the module <b>${module.title}</b>.`);
  }
  if (
    beforeIds.length === afterIds.length
    && beforeIds.join() !== afterIds.join()
    && beforeIds.every((id) => afterIds.includes(id))
  ) bits.push('Reorder the modules.');
  for (const module of after.modules) {
    const previous = before.modules.find((item) => item.id === module.id);
    if (!previous) continue;
    if (previous.title !== module.title) bits.push(`Rename <b>${previous.title}</b> to <b>${module.title}</b>.`);
    const previousLessons = previous.lessons ?? [];
    const nextLessons = module.lessons ?? [];
    for (const lesson of nextLessons) {
      if (!previousLessons.some((item) => item.id === lesson.id)) bits.push(`Add the lesson <b>${lesson.title}</b>.`);
    }
    for (const lesson of previousLessons) {
      if (!nextLessons.some((item) => item.id === lesson.id)) bits.push(`Remove the lesson <b>${lesson.title}</b>.`);
    }
    const previousLessonIds = previousLessons.map((lesson) => lesson.id);
    const nextLessonIds = nextLessons.map((lesson) => lesson.id);
    if (
      previousLessonIds.length === nextLessonIds.length
      && previousLessonIds.join() !== nextLessonIds.join()
      && previousLessonIds.every((id) => nextLessonIds.includes(id))
    ) bits.push(`Reorder the lessons in <b>${module.title}</b>.`);
    for (const lesson of nextLessons) {
      const old = previousLessons.find((item) => item.id === lesson.id);
      if (!old) continue;
      if (old.title !== lesson.title) bits.push(`Rename <b>${old.title}</b> to <b>${lesson.title}</b>.`);
      const oldCards = old.flashcards?.length ?? 0;
      const nextCards = lesson.flashcards?.length ?? 0;
      if (oldCards !== nextCards) bits.push(`Change <b>${lesson.title}</b> flashcards from ${oldCards} to ${nextCards}.`);
      const oldBlanks = old.blanks?.length ?? 0;
      const nextBlanks = lesson.blanks?.length ?? 0;
      if (oldBlanks !== nextBlanks) bits.push(`Change <b>${lesson.title}</b> blanks from ${oldBlanks} to ${nextBlanks}.`);
      if ((old.notes ?? '') !== (lesson.notes ?? '') || (old.summary ?? '') !== (lesson.summary ?? '')) {
        bits.push(`Update the notes for <b>${lesson.title}</b>.`);
      }
    }
    const oldQuiz = previous.quiz?.length ?? 0;
    const nextQuiz = module.quiz?.length ?? 0;
    if (oldQuiz !== nextQuiz) bits.push(`Change <b>${module.title}</b> quiz questions from ${oldQuiz} to ${nextQuiz}.`);
    else if (JSON.stringify(previous.quiz ?? []) !== JSON.stringify(module.quiz ?? [])) {
      bits.push(`Update the quiz for <b>${module.title}</b>.`);
    }
  }
  if (!bits.length) return 'Apply this edit to the course.';
  return bits.slice(0, 6).join(' ');
}

export function editCard(messageId: string, summary: string): StudioChatMessage['card'] {
  return {
    type: 'diff',
    title: 'Suggested edit',
    ops: [{
      id: messageId,
      status: 'pending',
      summary,
      op: { type: 'course_update' },
    }],
  };
}
