import axios from 'axios';
import type { CourseEditOperation, CourseUpdatePayload } from '../types/courseGeneration';

export type AssistantEditSource = 'local' | 'ai';

export interface EducatorAssistantResponse {
  reply: string;
  hasCourseChanges: boolean;
  courseUpdate: CourseUpdatePayload | null;
  operations?: CourseEditOperation[] | null;
  source?: AssistantEditSource;
  sessionId?: string;
  courseRevision?: string;
}

export interface EducatorAssistantRequest {
  message: string;
  sessionId?: string;
  courseRevision?: string;
}

export async function sendEducatorAssistantMessage(
  courseId: string,
  request: EducatorAssistantRequest,
): Promise<EducatorAssistantResponse> {
  const { data } = await axios.post<EducatorAssistantResponse>(
    `/api/educator/courses/${courseId}/assistant`,
    request,
  );
  return data;
}
