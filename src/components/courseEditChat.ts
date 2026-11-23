import type { EducatorAssistantResponse } from '../api/educatorAssistantApi';
import { sendEducatorAssistantMessage } from '../api/educatorAssistantApi';
import { fetchCourse, updateCourse } from '../api/educatorApi';
import { apiError, describeCourseEdit, proposedEdit, toEditableCourse } from '../educator/studio/liveCourse';
import type {
  CourseModule,
  CourseUpdatePayload,
  EditableCourse,
  PlaylistVideo,
} from '../types/courseGeneration';

/** Owner educators and admins — same gate as the Edit course action on this page. */
export function canEditCourseDetails(isOwner: boolean, role: string | undefined | null): boolean {
  return isOwner && (role === 'educator' || role === 'admin');
}

export type CourseDetailsEditSource = {
  title: string;
  description: string;
  difficulty: string;
  modules: CourseModule[];
  playlistVideos?: PlaylistVideo[];
  category?: string;
  contentLanguage?: string;
  isFree?: boolean;
  priceCents?: number;
  currency?: string;
};

export function editableFromDetails(course: CourseDetailsEditSource): EditableCourse {
  return {
    title: course.title ?? '',
    description: course.description ?? '',
    difficulty: course.difficulty ?? 'Intermediate',
    category: course.category,
    contentLanguage: course.contentLanguage,
    modules: course.modules ?? [],
    playlistVideos: course.playlistVideos,
    isFree: course.isFree,
    priceCents: course.priceCents,
    currency: course.currency,
  };
}

export function applyEditToCourseView<T extends CourseDetailsEditSource>(
  course: T,
  next: EditableCourse,
): T {
  return {
    ...course,
    title: next.title,
    description: next.description,
    difficulty: next.difficulty,
    modules: next.modules,
    playlistVideos: next.playlistVideos ?? course.playlistVideos,
    category: next.category ?? course.category,
    contentLanguage: next.contentLanguage ?? course.contentLanguage,
    isFree: next.isFree ?? course.isFree,
    priceCents: next.priceCents ?? course.priceCents,
    currency: next.currency ?? course.currency,
  };
}

export function plainEditSummary(before: EditableCourse, after: EditableCourse): string {
  const summary = describeCourseEdit(before, after).replace(/<\/?b>/g, '').replace(/\s+/g, ' ').trim();
  if (!summary || summary === 'Apply this edit to the course.') {
    return 'The course details are updated.';
  }
  return summary;
}

/** Confirmation only after a successful save. Never used on the failure path. */
export function savedEditMessage(reply: string, before: EditableCourse, after: EditableCourse): string {
  const saved = `Saved. ${plainEditSummary(before, after)}`;
  const lead = reply.trim();
  if (!lead) return saved;
  return `${lead}\n\n${saved}`;
}

function fingerprint(course: Pick<EditableCourse, 'title' | 'description' | 'difficulty' | 'modules'>): string {
  return JSON.stringify({
    title: course.title,
    description: course.description,
    difficulty: course.difficulty,
    modules: course.modules,
  });
}

/** Keep playlist video ids when the assistant did not name a new set. */
export function withKeptVideoIds(base: EditableCourse, payload: CourseUpdatePayload): CourseUpdatePayload {
  if (payload.includedVideoIds?.length) return payload;
  const ids = (base.playlistVideos ?? []).map((video) => video.videoId).filter((id) => id.length > 0);
  if (!ids.length) return payload;
  return { ...payload, includedVideoIds: ids };
}

export type CourseEditTurn =
  | {
      ok: true;
      changed: false;
      text: string;
      sessionId?: string;
      courseRevision?: string;
    }
  | {
      ok: true;
      changed: true;
      text: string;
      course: EditableCourse;
      sessionId?: string;
      courseRevision?: string;
    }
  | {
      ok: false;
      text: string;
      sessionId?: string;
      courseRevision?: string;
    };

export async function runCourseEditTurn(input: {
  courseId: string;
  base: EditableCourse;
  message: string;
  sessionId?: string;
  courseRevision?: string;
}): Promise<CourseEditTurn> {
  let res: EducatorAssistantResponse;
  try {
    res = await sendEducatorAssistantMessage(input.courseId, {
      message: input.message,
      ...(input.sessionId ? { sessionId: input.sessionId } : {}),
      ...(input.courseRevision ? { courseRevision: input.courseRevision } : {}),
    });
  } catch (err) {
    return { ok: false, text: apiError(err, 'Could not apply that edit.') };
  }

  const sessionId = res.sessionId;
  const courseRevision = res.courseRevision;
  const update = res.hasCourseChanges ? res.courseUpdate : null;
  const operations = res.hasCourseChanges ? (res.operations ?? null) : null;
  const proposed = proposedEdit(input.base, update, operations);
  const payload = proposed ? withKeptVideoIds(input.base, proposed) : null;

  if (!payload) {
    return {
      ok: true,
      changed: false,
      text: res.reply?.trim() || 'No changes to save.',
      sessionId,
      courseRevision,
    };
  }

  try {
    await updateCourse(input.courseId, payload);
  } catch (err) {
    return {
      ok: false,
      text: apiError(err, 'Could not save that edit.'),
      sessionId,
      courseRevision,
    };
  }

  let course: EditableCourse = payload;
  try {
    const fresh = toEditableCourse(await fetchCourse(input.courseId));
    if (fingerprint(fresh) !== fingerprint(input.base)) {
      course = {
        ...payload,
        ...fresh,
        playlistVideos: fresh.playlistVideos ?? payload.playlistVideos ?? input.base.playlistVideos,
      };
    }
  } catch {
    // The save already succeeded. Keep the payload that was stored.
  }

  return {
    ok: true,
    changed: true,
    text: savedEditMessage(res.reply || '', input.base, course),
    course,
    sessionId,
    courseRevision,
  };
}
