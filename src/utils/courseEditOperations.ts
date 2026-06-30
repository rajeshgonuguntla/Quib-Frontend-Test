import type {
  CourseEditOperation,
  CourseModule,
  CourseUpdatePayload,
  EditableCourse,
} from '../types/courseGeneration';

/** Apply Phase B patch operations on the editor form (mirrors backend applier). */
export function applyCourseEditOperations(
  base: EditableCourse,
  operations: CourseEditOperation[],
): EditableCourse {
  if (!operations.length) return base;

  let next: EditableCourse = {
    ...base,
    modules: base.modules.map(cloneModule),
  };

  for (const op of operations) {
    next = applyOne(next, op);
  }
  return next;
}

export function mergeAssistantResponse(
  base: EditableCourse,
  update: CourseUpdatePayload | null | undefined,
  operations: CourseEditOperation[] | null | undefined,
): EditableCourse {
  if (operations?.length) {
    return applyCourseEditOperations(base, operations);
  }
  if (update) {
    return mergeAssistantUpdate(base, update);
  }
  return base;
}

/** Build PUT payload after approving an assistant edit. */
export function buildSavePayloadFromAssistant(
  base: EditableCourse,
  result: {
    courseUpdate?: CourseUpdatePayload | null;
    operations?: CourseEditOperation[] | null;
  },
  includedVideoIds: Iterable<string> = [],
): CourseUpdatePayload {
  const merged = mergeAssistantResponse(base, result.courseUpdate, result.operations);
  const { playlistVideos: _pv, ...payload } = merged;
  const ids = result.courseUpdate?.includedVideoIds?.length
    ? result.courseUpdate.includedVideoIds
    : [...includedVideoIds];
  return { ...payload, includedVideoIds: ids };
}

function applyOne(course: EditableCourse, op: CourseEditOperation): EditableCourse {
  switch (op.type) {
    case 'SET':
      return applySet(course, op.path ?? '', op.value);
    case 'REORDER_MODULES':
      return applyReorderModules(course, op.order ?? []);
    case 'REORDER_LESSONS':
      return applyReorderLessons(course, op.moduleId ?? '', op.order ?? []);
    case 'DELETE_MODULE':
      return applyDeleteModule(course, op.moduleId ?? '');
    case 'DELETE_LESSON':
      return applyDeleteLesson(course, op.moduleId ?? '', op.lessonId ?? '');
    default:
      return course;
  }
}

function applySet(course: EditableCourse, path: string, value: unknown): EditableCourse {
  if (path === 'title' && typeof value === 'string') {
    return { ...course, title: value.trim() || course.title };
  }
  if (path === 'description' && typeof value === 'string') {
    return { ...course, description: value };
  }
  if (path === 'difficulty' && typeof value === 'string') {
    return { ...course, difficulty: value };
  }
  if (path === 'category' && typeof value === 'string') {
    return { ...course, category: value };
  }
  if (path === 'contentLanguage' && typeof value === 'string') {
    return { ...course, contentLanguage: value };
  }
  if (path.startsWith('modules.')) {
    return applyModulePathSet(course, path.slice('modules.'.length), value);
  }
  return course;
}

function applyModulePathSet(course: EditableCourse, remainder: string, value: unknown): EditableCourse {
  const parts = remainder.split('.');
  const moduleId = parts[0];
  const modules = course.modules.map((m) => ({ ...m, lessons: [...m.lessons], quiz: [...m.quiz] }));
  const mi = modules.findIndex((m) => m.id === moduleId);
  if (mi < 0) return course;

  if (parts[1] === 'title' && typeof value === 'string') {
    modules[mi] = { ...modules[mi], title: value };
    return { ...course, modules };
  }
  if (parts[1] === 'description' && typeof value === 'string') {
    modules[mi] = { ...modules[mi], description: value };
    return { ...course, modules };
  }
  if (parts[1] === 'lessons' && parts.length >= 4) {
    const lessonId = parts[2];
    const field = parts[3];
    const lessons = modules[mi].lessons.map((l) => ({ ...l }));
    const li = lessons.findIndex((l) => l.id === lessonId);
    if (li < 0) return course;
    const lesson = { ...lessons[li] };
    if (field === 'title' && typeof value === 'string') lesson.title = value;
    else if (field === 'summary' && typeof value === 'string') lesson.summary = value;
    else if (field === 'notes' && typeof value === 'string') lesson.notes = value;
    else if (field === 'takeaway' && typeof value === 'string') lesson.takeaway = value;
    else if (field === 'duration' && typeof value === 'string') lesson.duration = value;
    else if (field === 'type' && (value === 'video' || value === 'reading')) lesson.type = value;
    lessons[li] = lesson;
    modules[mi] = { ...modules[mi], lessons };
    return { ...course, modules };
  }
  return course;
}

function applyReorderModules(course: EditableCourse, order: string[]): EditableCourse {
  if (!order.length) return course;
  const byId = new Map(course.modules.map((m) => [m.id, m]));
  const reordered: CourseModule[] = [];
  for (const id of order) {
    const m = byId.get(id);
    if (m) {
      reordered.push(m);
      byId.delete(id);
    }
  }
  byId.forEach((m) => reordered.push(m));
  return { ...course, modules: reordered };
}

function applyReorderLessons(course: EditableCourse, moduleId: string, order: string[]): EditableCourse {
  if (!order.length) return course;
  const modules = course.modules.map((m) => ({ ...m, lessons: [...m.lessons], quiz: [...m.quiz] }));
  const mi = modules.findIndex((m) => m.id === moduleId);
  if (mi < 0) return course;
  const byId = new Map(modules[mi].lessons.map((l) => [l.id, l]));
  const reordered = [];
  for (const id of order) {
    const l = byId.get(id);
    if (l) {
      reordered.push(l);
      byId.delete(id);
    }
  }
  byId.forEach((l) => reordered.push(l));
  modules[mi] = { ...modules[mi], lessons: reordered };
  return { ...course, modules };
}

function applyDeleteModule(course: EditableCourse, moduleId: string): EditableCourse {
  if (course.modules.length <= 1) return course;
  return { ...course, modules: course.modules.filter((m) => m.id !== moduleId) };
}

function applyDeleteLesson(course: EditableCourse, moduleId: string, lessonId: string): EditableCourse {
  const modules = course.modules.map((m) => {
    if (m.id !== moduleId || m.lessons.length <= 1) return m;
    return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) };
  });
  return { ...course, modules };
}

function cloneModule(m: CourseModule): CourseModule {
  return {
    ...m,
    lessons: m.lessons.map((l) => ({ ...l, keyConcepts: l.keyConcepts ? [...l.keyConcepts] : undefined })),
    quiz: m.quiz.map((q) => ({ ...q, options: [...q.options] })),
  };
}

function mergeAssistantUpdate(base: EditableCourse, update: CourseUpdatePayload): EditableCourse {
  return {
    ...base,
    title: update.title?.trim() ? update.title : base.title,
    description: update.description ?? base.description,
    difficulty: update.difficulty ?? base.difficulty,
    category: update.category ?? base.category,
    contentLanguage: update.contentLanguage ?? base.contentLanguage,
    modules: update.modules?.length ? update.modules : base.modules,
    playlistVideos: base.playlistVideos,
  };
}

export type { CourseEditOperation };
