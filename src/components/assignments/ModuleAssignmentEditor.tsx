import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Trash2, Upload } from 'lucide-react';
import {
  ASSIGNMENT_FILE_ACCEPT,
  ASSIGNMENT_MAX_BYTES,
  deleteModuleAssignment,
  downloadAssignmentBrief,
  downloadStudentSubmission,
  fetchModuleAssignment,
  gradeAssignmentSubmission,
  listAssignmentSubmissions,
  upsertModuleAssignment,
  type AssignmentSubmissionListItem,
  type ModuleAssignment,
} from '../../api/assignmentApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ModuleAssignmentEditorProps {
  courseId: string;
  moduleId: string;
}

export function ModuleAssignmentEditor({ courseId, moduleId }: ModuleAssignmentEditorProps) {
  const [assignment, setAssignment] = useState<ModuleAssignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  const [dueAt, setDueAt] = useState('');
  const [required, setRequired] = useState(true);
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [briefFile, setBriefFile] = useState<File | null>(null);

  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { points: string; feedback: string }>>({});

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModuleAssignment(courseId, moduleId);
      setAssignment(data);
      if (data) {
        setTitle(data.title);
        setInstructions(data.instructions ?? '');
        setMaxPoints(data.maxPoints);
        setDueAt(data.dueAt ? data.dueAt.slice(0, 16) : '');
        setRequired(data.required);
        setAllowLateSubmission(data.allowLateSubmission ?? false);
        const subs = await listAssignmentSubmissions(courseId, moduleId);
        setSubmissions(subs);
      } else {
        setTitle('');
        setInstructions('');
        setMaxPoints(100);
        setDueAt('');
        setRequired(true);
        setAllowLateSubmission(false);
        setSubmissions([]);
      }
    } catch {
      setError('Could not load assignment.');
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!assignment && !briefFile) {
      setError('Upload a brief PDF or TXT when creating a new assignment');
      return;
    }
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const saved = await upsertModuleAssignment(courseId, moduleId, {
        title: title.trim(),
        instructions: instructions.trim() || undefined,
        maxPoints,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
        required,
        allowLateSubmission,
        briefFile,
      });
      setAssignment(saved);
      setBriefFile(null);
      setStatus('Assignment saved');
      const subs = await listAssignmentSubmissions(courseId, moduleId);
      setSubmissions(subs);
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!assignment || !window.confirm('Delete this assignment and all submissions?')) return;
    setSaving(true);
    try {
      await deleteModuleAssignment(courseId, moduleId);
      setAssignment(null);
      setSubmissions([]);
      setStatus('Assignment deleted');
    } catch {
      setError('Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const handleGrade = async (submissionId: string) => {
    const draft = gradeDrafts[submissionId];
    const points = Number.parseInt(draft?.points ?? '', 10);
    if (!Number.isFinite(points)) {
      setError('Enter a valid grade');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await gradeAssignmentSubmission(courseId, moduleId, submissionId, points, draft?.feedback);
      setStatus('Graded');
      await reload();
    } catch (err) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message ?? 'Grading failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="animate-spin" size={14} /> Loading assignment…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Module assignment</p>
        {assignment && (
          <Button type="button" size="sm" variant="ghost" onClick={() => void handleDelete()} disabled={saving}>
            <Trash2 size={14} className="text-destructive" /> Delete
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Instructions</Label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Max points</Label>
          <Input type="number" min={1} max={1000} value={maxPoints} onChange={(e) => setMaxPoints(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Due date (optional)</Label>
          <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
        Required for course progress (student must be graded)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={allowLateSubmission}
          onChange={(e) => setAllowLateSubmission(e.target.checked)}
        />
        Allow late submissions after due date
      </label>

      <div className="space-y-2">
        <Label>Brief file (.pdf or .txt, max 5 MB)</Label>
        {assignment?.hasBrief && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Current: {assignment.briefFilename}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void downloadAssignmentBrief(courseId, moduleId, assignment.briefFilename ?? 'brief.pdf')}
            >
              <Download size={12} /> Download
            </Button>
          </div>
        )}
        <input
          type="file"
          accept={ASSIGNMENT_FILE_ACCEPT}
          className="text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f && f.size > ASSIGNMENT_MAX_BYTES) {
              setError('File must be 5 MB or smaller');
              return;
            }
            setBriefFile(f);
            setError(null);
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {status && <p className="text-sm text-muted-foreground">{status}</p>}

      <Button type="button" size="sm" onClick={() => void handleSave()} disabled={saving}>
        {saving ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
        {assignment ? 'Update assignment' : 'Create assignment'}
      </Button>

      {submissions.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium">Student submissions ({submissions.length})</p>
          {submissions.map((sub) => (
            <div key={sub.submissionId} className="rounded-md border border-border p-3 space-y-2">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-medium">{sub.studentName}</span>
                <span className="text-muted-foreground">{sub.status}</span>
              </div>
              <p className="text-xs text-muted-foreground">{sub.filename}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void downloadStudentSubmission(courseId, moduleId, sub.submissionId, sub.filename)}
              >
                <Download size={12} /> Download
              </Button>
              {sub.status !== 'graded' ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder={`Grade / ${maxPoints}`}
                    value={gradeDrafts[sub.submissionId]?.points ?? ''}
                    onChange={(e) => setGradeDrafts((prev) => ({
                      ...prev,
                      [sub.submissionId]: { points: e.target.value, feedback: prev[sub.submissionId]?.feedback ?? '' },
                    }))}
                  />
                  <Input
                    placeholder="Feedback (optional)"
                    value={gradeDrafts[sub.submissionId]?.feedback ?? ''}
                    onChange={(e) => setGradeDrafts((prev) => ({
                      ...prev,
                      [sub.submissionId]: { points: prev[sub.submissionId]?.points ?? '', feedback: e.target.value },
                    }))}
                  />
                  <Button type="button" size="sm" className="sm:col-span-2" onClick={() => void handleGrade(sub.submissionId)} disabled={saving}>
                    Save grade
                  </Button>
                </div>
              ) : (
                <p className="text-sm">
                  Grade: <strong>{sub.gradePoints}</strong> / {sub.maxPoints}
                  {sub.educatorFeedback ? ` — ${sub.educatorFeedback}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
