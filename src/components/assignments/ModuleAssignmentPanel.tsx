import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText, Loader2, Upload } from 'lucide-react';
import {
  ASSIGNMENT_FILE_ACCEPT,
  ASSIGNMENT_MAX_BYTES,
  assignmentErrorMessage,
  downloadAssignmentBrief,
  downloadOwnSubmission,
  fetchCourseAssignment,
  submitCourseAssignment,
  type CourseAssignment,
} from '../../api/assignmentApi';
import { Button } from '../ui/button';

type ThemeColors = {
  text: string;
  text2: string;
  text3: string;
  border: string;
  bg1: string;
  red: string;
};

interface CourseAssignmentPanelProps {
  courseId: string;
  C: ThemeColors;
  isDark: boolean;
  onSubmitted?: () => void;
}

export function CourseAssignmentPanel({
  courseId,
  C,
  isDark,
  onSubmitted,
}: CourseAssignmentPanelProps) {
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCourseAssignment(courseId);
      setAssignment(data);
    } catch {
      setAssignment(null);
      setError('Could not load assignment.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleFileSelected = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > ASSIGNMENT_MAX_BYTES) {
      setError('File must be 5 MB or smaller');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    if (!selectedFile) {
      fileInputRef.current?.click();
      setError('Choose a PDF or TXT file (max 5 MB), then click Submit again.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const updated = await submitCourseAssignment(courseId, selectedFile);
      setAssignment(updated);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSubmitted?.();
    } catch (err) {
      setError(assignmentErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 justify-center" style={{ color: C.text3 }}>
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading assignment…
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center" style={{ color: C.text3 }}>
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>No assignment has been posted for this course yet.</p>
      </div>
    );
  }

  const mine = assignment.mySubmission;
  const awaitingReview = mine?.status === 'submitted';
  const passed = mine?.status === 'graded';
  const returned = mine?.status === 'returned';
  const duePassed = assignment.dueAt
    && new Date(assignment.dueAt).getTime() < Date.now()
    && !assignment.allowLateSubmission;
  const canSubmit = (!mine || returned) && !duePassed;

  const submissionStatusLabel = (status: string) => {
    if (status === 'submitted') return 'Submitted — awaiting educator review';
    if (status === 'graded') return 'Passed';
    if (status === 'returned') return 'Not passed — resubmit required';
    return status;
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[0.7rem] mb-3 uppercase tracking-widest" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
        Course assignment
      </p>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 400, color: C.text, marginBottom: 8 }}>
        {assignment.title}
      </h1>
      {assignment.required && (
        <p className="text-xs mb-4" style={{ color: C.red }}>Required — pass ({assignment.passingPoints}+ / {assignment.maxPoints}) to complete the course</p>
      )}
      {assignment.instructions && (
        <p className="text-sm mb-6 whitespace-pre-wrap" style={{ color: C.text2 }}>{assignment.instructions}</p>
      )}
      {assignment.dueAt && (
        <p className="text-xs mb-4" style={{ color: duePassed ? C.red : C.text3 }}>
          Due {new Date(assignment.dueAt).toLocaleString()}
          {duePassed ? ' — past due (submissions closed)' : ''}
          {assignment.allowLateSubmission ? ' · late submissions allowed' : ''}
        </p>
      )}

      {assignment.hasBrief && (
        <div className="mb-6 p-4 rounded-lg" style={{ border: `1px solid ${C.border}`, background: C.bg1 }}>
          <p className="text-sm font-medium mb-2" style={{ color: C.text }}>Educator brief</p>
          <p className="text-xs mb-3" style={{ color: C.text3 }}>
            {assignment.briefFilename}
            {assignment.briefSizeBytes ? ` · ${(assignment.briefSizeBytes / 1024).toFixed(1)} KB` : ''}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void downloadAssignmentBrief(courseId, assignment.briefFilename ?? 'brief.pdf')}
          >
            <Download size={14} /> Download brief
          </Button>
        </div>
      )}

      {mine && (
        <div
          className="mb-6 p-4 rounded-lg"
          style={{
            border: `1px solid ${C.border}`,
            background: passed
              ? (isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)')
              : returned
                ? (isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)')
                : C.bg1,
          }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: C.text }}>Your submission</p>
          <p className="text-xs mb-2" style={{ color: passed ? C.text : returned ? C.red : C.text3 }}>
            {submissionStatusLabel(mine.status)}
          </p>
          <p className="text-xs mb-2" style={{ color: C.text3 }}>{mine.filename}</p>
          {passed && mine.gradePoints != null && (
            <p className="text-sm mb-2" style={{ color: C.text }}>
              Score: <strong>{mine.gradePoints}</strong> / {mine.maxPoints ?? assignment.maxPoints}
            </p>
          )}
          {returned && mine.gradePoints != null && (
            <p className="text-sm mb-2" style={{ color: C.text2 }}>
              Score: {mine.gradePoints} / {mine.maxPoints ?? assignment.maxPoints} (need {assignment.passingPoints}+ to pass)
            </p>
          )}
          {mine.educatorFeedback && (
            <p className="text-sm mb-2 whitespace-pre-wrap" style={{ color: C.text2 }}>{mine.educatorFeedback}</p>
          )}
          {awaitingReview && (
            <p className="text-xs mb-2" style={{ color: C.text3 }}>
              You cannot submit again until your educator reviews this work.
            </p>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void downloadOwnSubmission(courseId, mine.filename)}
          >
            <Download size={14} /> Download your file
          </Button>
        </div>
      )}

      {canSubmit && (
        <div className="p-4 rounded-lg" style={{ border: `1px solid ${C.border}` }}>
          <p className="text-sm font-medium mb-3" style={{ color: C.text }}>
            {returned ? 'Resubmit your work' : 'Submit your work'}
          </p>
          <p className="text-xs mb-3" style={{ color: C.text3 }}>PDF or TXT only, max 5 MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ASSIGNMENT_FILE_ACCEPT}
            className="sr-only"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              {selectedFile ? 'Change file' : 'Choose file'}
            </Button>
            {selectedFile && (
              <span className="text-xs" style={{ color: C.text3 }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
          {!selectedFile && (
            <p className="text-xs mb-3" style={{ color: C.text3 }}>
              Step 1: choose your file. Step 2: click Submit.
            </p>
          )}
          {error && <p className="text-sm text-destructive mb-2">{error}</p>}
          <Button type="button" disabled={uploading} onClick={() => void handleSubmit()}>
            {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
            {uploading ? 'Uploading…' : 'Submit'}
          </Button>
        </div>
      )}
    </div>
  );
}

/** @deprecated Use CourseAssignmentPanel */
export const ModuleAssignmentPanel = CourseAssignmentPanel;
