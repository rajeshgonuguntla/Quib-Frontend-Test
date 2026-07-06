import axios from 'axios';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = '.pdf,.txt';

export interface AssignmentSubmissionSummary {
  submissionId: string;
  filename: string;
  sizeBytes: number;
  status: 'submitted' | 'graded' | 'returned';
  gradePoints?: number | null;
  maxPoints?: number | null;
  educatorFeedback?: string | null;
  submittedAt?: string;
  gradedAt?: string | null;
}

export interface ModuleAssignment {
  assignmentId: string;
  moduleId: string;
  title: string;
  instructions?: string | null;
  hasBrief: boolean;
  briefFilename?: string | null;
  briefSizeBytes?: number | null;
  maxPoints: number;
  dueAt?: string | null;
  allowLateSubmission?: boolean;
  required: boolean;
  mySubmission?: AssignmentSubmissionSummary | null;
}

export interface CourseAssignmentModuleSummary {
  moduleId: string;
  title: string;
  dueAt?: string | null;
  required: boolean;
}

export interface AssignmentSubmissionListItem {
  submissionId: string;
  studentEmail: string;
  studentName: string;
  filename: string;
  sizeBytes: number;
  status: string;
  gradePoints?: number | null;
  maxPoints?: number | null;
  educatorFeedback?: string | null;
  submittedAt?: string;
  gradedAt?: string | null;
}

function assignmentBase(courseId: string, moduleId: string) {
  return `/api/courses/${courseId}/modules/${moduleId}/assignment`;
}

function assertClientFile(file: File) {
  const lower = file.name.toLowerCase();
  if (!lower.endsWith('.pdf') && !lower.endsWith('.txt')) {
    throw new Error('Only .pdf and .txt files are allowed');
  }
  if (file.size === 0) {
    throw new Error('File is empty');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File must be 5 MB or smaller');
  }
}

export async function fetchCourseAssignmentSummary(
  courseId: string,
): Promise<CourseAssignmentModuleSummary[]> {
  const res = await axios.get<CourseAssignmentModuleSummary[]>(
    `/api/courses/${courseId}/assignments/summary`,
  );
  return res.data ?? [];
}

export async function fetchModuleAssignment(
  courseId: string,
  moduleId: string,
): Promise<ModuleAssignment | null> {
  try {
    const res = await axios.get<ModuleAssignment>(assignmentBase(courseId, moduleId));
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      const msg = String(err.response.data?.message ?? '');
      if (msg.toLowerCase().includes('not found')) return null;
    }
    throw err;
  }
}

export async function upsertModuleAssignment(
  courseId: string,
  moduleId: string,
  fields: {
    title: string;
    instructions?: string;
    maxPoints?: number;
    dueAt?: string;
    required?: boolean;
    allowLateSubmission?: boolean;
    briefFile?: File | null;
  },
): Promise<ModuleAssignment> {
  const form = new FormData();
  form.append('title', fields.title);
  if (fields.instructions) form.append('instructions', fields.instructions);
  if (fields.maxPoints != null) form.append('maxPoints', String(fields.maxPoints));
  if (fields.dueAt) form.append('dueAt', fields.dueAt);
  if (fields.required != null) form.append('required', String(fields.required));
  if (fields.allowLateSubmission != null) {
    form.append('allowLateSubmission', String(fields.allowLateSubmission));
  }
  if (fields.briefFile) {
    assertClientFile(fields.briefFile);
    form.append('briefFile', fields.briefFile);
  }
  const res = await axios.put<ModuleAssignment>(assignmentBase(courseId, moduleId), form);
  return res.data;
}

export async function deleteModuleAssignment(courseId: string, moduleId: string): Promise<void> {
  await axios.delete(assignmentBase(courseId, moduleId));
}

export async function submitModuleAssignment(
  courseId: string,
  moduleId: string,
  file: File,
): Promise<ModuleAssignment> {
  assertClientFile(file);
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post<ModuleAssignment>(
    `${assignmentBase(courseId, moduleId)}/submissions`,
    form,
  );
  return res.data;
}

export async function listAssignmentSubmissions(
  courseId: string,
  moduleId: string,
): Promise<AssignmentSubmissionListItem[]> {
  const res = await axios.get<AssignmentSubmissionListItem[]>(
    `${assignmentBase(courseId, moduleId)}/submissions`,
  );
  return res.data ?? [];
}

export async function gradeAssignmentSubmission(
  courseId: string,
  moduleId: string,
  submissionId: string,
  gradePoints: number,
  feedback?: string,
): Promise<AssignmentSubmissionListItem> {
  const res = await axios.post<AssignmentSubmissionListItem>(
    `${assignmentBase(courseId, moduleId)}/submissions/${submissionId}/grade`,
    { gradePoints, feedback: feedback ?? null },
  );
  return res.data;
}

async function downloadBlob(url: string, fallbackName: string) {
  const res = await axios.get(url, { responseType: 'blob' });
  const disposition = res.headers['content-disposition'] as string | undefined;
  let filename = fallbackName;
  const match = disposition?.match(/filename="([^"]+)"/);
  if (match?.[1]) filename = match[1];
  const blobUrl = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

export function downloadAssignmentBrief(courseId: string, moduleId: string, fallbackName: string) {
  return downloadBlob(`${assignmentBase(courseId, moduleId)}/brief/download`, fallbackName);
}

export function downloadOwnSubmission(courseId: string, moduleId: string, fallbackName: string) {
  return downloadBlob(`${assignmentBase(courseId, moduleId)}/submissions/mine/download`, fallbackName);
}

export function downloadStudentSubmission(
  courseId: string,
  moduleId: string,
  submissionId: string,
  fallbackName: string,
) {
  return downloadBlob(
    `${assignmentBase(courseId, moduleId)}/submissions/${submissionId}/download`,
    fallbackName,
  );
}

export const ASSIGNMENT_FILE_ACCEPT = ACCEPT;
export const ASSIGNMENT_MAX_BYTES = MAX_BYTES;
