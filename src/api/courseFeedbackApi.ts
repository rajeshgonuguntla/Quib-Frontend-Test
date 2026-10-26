import axios from 'axios';

export interface CourseReview {
  rating: number;
  reviewText: string | null;
  updatedAt: string;
}

export interface LessonComment {
  id: string;
  body: string;
  authorName?: string | null;
  isOwner?: boolean;
  answered?: boolean;
  educatorReply?: string | null;
  createdAt?: string | null;
}

export interface LessonReaction {
  value: number;
  thumbsUp: number;
  thumbsDown: number;
}

export interface ContentFlag {
  id: string;
  courseId?: string;
  lessonId?: string | null;
  reason: string;
  status?: string;
  createdAt?: string | null;
}

export async function submitCourseReview(
  courseId: string,
  rating: number,
  reviewText?: string,
): Promise<CourseReview> {
  const { data } = await axios.post<CourseReview>(`/api/courses/${courseId}/reviews`, {
    rating,
    reviewText: reviewText ?? null,
  });
  return data;
}

export async function fetchMyCourseReview(courseId: string): Promise<CourseReview | null> {
  const { data } = await axios.get<CourseReview | null>(`/api/courses/${courseId}/reviews/mine`);
  return data;
}

export async function replyToLearnerComment(
  courseId: string,
  commentId: string,
  reply: string,
): Promise<void> {
  await axios.post(
    `/api/educator/analytics/courses/${courseId}/comments/${commentId}/reply`,
    { reply },
  );
}

export async function fetchLessonComments(
  courseId: string,
  lessonId: string,
): Promise<LessonComment[]> {
  const { data } = await axios.get<LessonComment[]>(
    `/api/courses/${courseId}/lessons/${lessonId}/comments`,
  );
  return data ?? [];
}

export async function postLessonComment(
  courseId: string,
  lessonId: string,
  body: string,
): Promise<LessonComment> {
  const { data } = await axios.post<LessonComment>(
    `/api/courses/${courseId}/lessons/${lessonId}/comments`,
    { body },
  );
  return data;
}

/** value: 1 up, -1 down, 0 clear */
export async function setLessonReaction(
  courseId: string,
  lessonId: string,
  value: 1 | 0 | -1,
): Promise<LessonReaction> {
  const { data } = await axios.post<LessonReaction>(
    `/api/courses/${courseId}/lessons/${lessonId}/reaction`,
    { value },
  );
  return data;
}

export async function reportContentFlag(
  courseId: string,
  reason: string,
  lessonId?: string,
): Promise<ContentFlag> {
  const { data } = await axios.post<ContentFlag>(`/api/courses/${courseId}/content-flags`, {
    reason,
    lessonId: lessonId || null,
  });
  return data;
}
