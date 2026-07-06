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

export interface CourseAssignment {
  assignmentId: string;
  title: string;
  instructions?: string | null;
  hasBrief: boolean;
  briefFilename?: string | null;
  briefSizeBytes?: number | null;
  maxPoints: number;
  passingPoints: number;
  dueAt?: string | null;
  allowLateSubmission?: boolean;
  required: boolean;
  mySubmission?: AssignmentSubmissionSummary | null;
}

export interface CourseAssignmentSummary {
  title: string;
  dueAt?: string | null;
  required: boolean;
  passingPoints: number;
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

function assignmentErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && !axios.isAxiosError(err)) {
    return err.message || fallback;
  }
  if (axios.isAxiosError(err)) {
    const msg = String(err.response?.data?.message ?? '');
    if (msg) return msg;
  }
  return fallback;
}

function assignmentBase(courseId: string) {
  return `/api/courses/${courseId}/assignment`;
}

/** Let the browser set multipart boundary — do not force Content-Type. */
function postMultipart<T>(url: string, form: FormData) {
  return axios.post<T>(url, form, {
    transformRequest: [(data, headers) => {
      if (data instanceof FormData && headers) {
        if (typeof headers.delete === 'function') {
          headers.delete('Content-Type');
        } else {
          delete (headers as Record<string, string>)['Content-Type'];
        }
      }
      return data;
    }],
  });
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
): Promise<CourseAssignmentSummary | null> {
  const res = await axios.get<CourseAssignmentSummary[]>(
    `/api/courses/${courseId}/assignments/summary`,
  );
  const items = res.data ?? [];
  return items.length > 0 ? items[0] : null;
}

export async function fetchCourseAssignment(
  courseId: string,
): Promise<CourseAssignment | null> {
  try {
    const res = await axios.get<CourseAssignment>(assignmentBase(courseId));
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      const msg = String(err.response.data?.message ?? '');
      if (msg.toLowerCase().includes('not found')) return null;
    }
    throw err;
  }
}

export async function upsertCourseAssignment(
  courseId: string,
  fields: {
    title: string;
    instructions?: string;
    maxPoints?: number;
    passingPoints?: number;
    dueAt?: string;
    required?: boolean;
    allowLateSubmission?: boolean;
    briefFile?: File | null;
  },
): Promise<CourseAssignment> {
  const form = new FormData();
  form.append('title', fields.title);
  if (fields.instructions) form.append('instructions', fields.instructions);
  if (fields.maxPoints != null) form.append('maxPoints', String(fields.maxPoints));
  if (fields.passingPoints != null) form.append('passingPoints', String(fields.passingPoints));
  if (fields.dueAt) form.append('dueAt', fields.dueAt);
  if (fields.required != null) form.append('required', String(fields.required));
  if (fields.allowLateSubmission != null) {
    form.append('allowLateSubmission', String(fields.allowLateSubmission));
  }
  if (fields.briefFile) {
    assertClientFile(fields.briefFile);
    form.append('briefFile', fields.briefFile, fields.briefFile.name);
  }

  const res = await postMultipart<CourseAssignment>(assignmentBase(courseId), form);
  return res.data;
}

export async function deleteCourseAssignment(courseId: string): Promise<void> {
  await axios.delete(assignmentBase(courseId));
}

export async function submitCourseAssignment(
  courseId: string,
  file: File,
): Promise<CourseAssignment> {
  assertClientFile(file);
  const form = new FormData();
  form.append('file', file, file.name);
  const res = await postMultipart<CourseAssignment>(
    `${assignmentBase(courseId)}/submissions`,
    form,
  );
  return res.data;
}

export async function listAssignmentSubmissions(
  courseId: string,
): Promise<AssignmentSubmissionListItem[]> {
  const res = await axios.get<AssignmentSubmissionListItem[]>(
    `${assignmentBase(courseId)}/submissions`,
  );
  return res.data ?? [];
}

export async function gradeAssignmentSubmission(
  courseId: string,
  submissionId: string,
  gradePoints: number,
  feedback?: string,
): Promise<AssignmentSubmissionListItem> {
  const res = await axios.post<AssignmentSubmissionListItem>(
    `${assignmentBase(courseId)}/submissions/${submissionId}/grade`,
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

export function downloadAssignmentBrief(courseId: string, fallbackName: string) {
  return downloadBlob(`${assignmentBase(courseId)}/brief/download`, fallbackName);
}

export function downloadOwnSubmission(courseId: string, fallbackName: string) {
  return downloadBlob(`${assignmentBase(courseId)}/submissions/mine/download`, fallbackName);
}

export function downloadStudentSubmission(
  courseId: string,
  submissionId: string,
  fallbackName: string,
) {
  return downloadBlob(
    `${assignmentBase(courseId)}/submissions/${submissionId}/download`,
    fallbackName,
  );
}

export { assignmentErrorMessage };
export const ASSIGNMENT_FILE_ACCEPT = ACCEPT;
export const ASSIGNMENT_MAX_BYTES = MAX_BYTES;
