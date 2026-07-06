import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Loader2, Upload } from 'lucide-react';
import {
  ASSIGNMENT_FILE_ACCEPT,
  ASSIGNMENT_MAX_BYTES,
  downloadAssignmentBrief,
  downloadOwnSubmission,
  fetchModuleAssignment,
  submitModuleAssignment,
  type ModuleAssignment,
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

interface ModuleAssignmentPanelProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  C: ThemeColors;
  isDark: boolean;
  onSubmitted?: () => void;
}

export function ModuleAssignmentPanel({
  courseId,
  moduleId,
  moduleTitle,
  C,
  isDark,
  onSubmitted,
}: ModuleAssignmentPanelProps) {
  const [assignment, setAssignment] = useState<ModuleAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModuleAssignment(courseId, moduleId);
      setAssignment(data);
    } catch {
      setAssignment(null);
      setError('Could not load assignment.');
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSubmit = async () => {
    if (!selectedFile || !assignment) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await submitModuleAssignment(courseId, moduleId, selectedFile);
      setAssignment(updated);
      setSelectedFile(null);
      onSubmitted?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      if (typeof err === 'object' && err && 'response' in err) {
        const ax = err as { response?: { data?: { message?: string } } };
        setError(ax.response?.data?.message ?? 'Upload failed');
      } else {
        setError(msg);
      }
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
        <p>No assignment has been posted for this module yet.</p>
      </div>
    );
  }

  const mine = assignment.mySubmission;
  const graded = mine?.status === 'graded';
  const duePassed = assignment.dueAt
    && new Date(assignment.dueAt).getTime() < Date.now()
    && !assignment.allowLateSubmission;
  const canSubmit = !graded && !duePassed;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-[0.7rem] mb-3 uppercase tracking-widest" style={{ color: C.text3, fontFamily: 'var(--mono)' }}>
        {moduleTitle} · Assignment
      </p>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 400, color: C.text, marginBottom: 8 }}>
        {assignment.title}
      </h1>
      {assignment.required && (
        <p className="text-xs mb-4" style={{ color: C.red }}>Required — graded submission counts toward course progress</p>
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
            onClick={() => void downloadAssignmentBrief(courseId, moduleId, assignment.briefFilename ?? 'brief.pdf')}
          >
            <Download size={14} /> Download brief
          </Button>
        </div>
      )}

      {mine && (
        <div className="mb-6 p-4 rounded-lg" style={{ border: `1px solid ${C.border}`, background: isDark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.04)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: C.text }}>Your submission</p>
          <p className="text-xs mb-2" style={{ color: C.text3 }}>{mine.filename} · {mine.status}</p>
          {graded && mine.gradePoints != null && (
            <p className="text-sm mb-2" style={{ color: C.text }}>
              Grade: <strong>{mine.gradePoints}</strong> / {mine.maxPoints ?? assignment.maxPoints}
            </p>
          )}
          {mine.educatorFeedback && (
            <p className="text-sm mb-2 whitespace-pre-wrap" style={{ color: C.text2 }}>{mine.educatorFeedback}</p>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void downloadOwnSubmission(courseId, moduleId, mine.filename)}
          >
            <Download size={14} /> Download your file
          </Button>
        </div>
      )}

      {canSubmit && (
        <div className="p-4 rounded-lg" style={{ border: `1px solid ${C.border}` }}>
          <p className="text-sm font-medium mb-3" style={{ color: C.text }}>
            {mine ? 'Replace submission' : 'Submit your work'}
          </p>
          <p className="text-xs mb-3" style={{ color: C.text3 }}>PDF or TXT only, max 5 MB</p>
          <input
            type="file"
            accept={ASSIGNMENT_FILE_ACCEPT}
            className="text-sm mb-3 block w-full"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > ASSIGNMENT_MAX_BYTES) {
                setError('File must be 5 MB or smaller');
                e.target.value = '';
                return;
              }
              setSelectedFile(f);
              setError(null);
            }}
          />
          {error && <p className="text-sm text-destructive mb-2">{error}</p>}
          <Button type="button" disabled={!selectedFile || uploading} onClick={() => void handleSubmit()}>
            {uploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
            {uploading ? 'Uploading…' : 'Submit'}
          </Button>
        </div>
      )}
    </div>
  );
}
