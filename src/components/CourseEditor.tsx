import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { Loader2, Plus, Save } from 'lucide-react';
import { updateCourse } from '../api/educatorApi';
import type { CourseModule, CourseQuizQuestion, EditableCourse } from '../types/courseGeneration';
import { PageHeader } from '../shell/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

export function CourseEditor() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<EditableCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<EditableCourse & { modules: CourseModule[]; isOwner?: boolean }>(`/api/course/${courseId}`);
        if (!mounted) return;
        if (!data.isOwner) {
          setError('You can only edit courses you created.');
          return;
        }
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          difficulty: data.difficulty ?? 'Intermediate',
          category: data.category,
          modules: data.modules ?? [],
        });
      } catch {
        if (mounted) setError('Could not load course for editing.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [courseId]);

  const updateModule = (index: number, patch: Partial<CourseModule>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      modules[index] = { ...modules[index], ...patch };
      return { ...prev, modules };
    });
  };

  const updateQuiz = (moduleIndex: number, quizIndex: number, patch: Partial<CourseQuizQuestion>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      const quiz = [...(modules[moduleIndex].quiz ?? [])];
      quiz[quizIndex] = { ...quiz[quizIndex], ...patch };
      modules[moduleIndex] = { ...modules[moduleIndex], quiz };
      return { ...prev, modules };
    });
  };

  const addQuizOption = (moduleIndex: number, quizIndex: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      const quiz = [...(modules[moduleIndex].quiz ?? [])];
      const options = [...(quiz[quizIndex].options ?? [])];
      if (options.length >= 4) return prev;
      options.push(`Option ${String.fromCharCode(65 + options.length)}`);
      quiz[quizIndex] = { ...quiz[quizIndex], options };
      modules[moduleIndex] = { ...modules[moduleIndex], quiz };
      return { ...prev, modules };
    });
  };

  const handleSave = async () => {
    if (!courseId || !form) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      await updateCourse(courseId, form);
      setStatus('Course saved.');
      navigate(`/course-details/${courseId}`);
    } catch (err) {
      setError(axiosMessage(err) ?? 'Could not save course.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="animate-spin" size={16} /> Loading editor…
      </div>
    );
  }

  if (error && !form) {
    return (
      <div>
        <PageHeader label="Create" title="Edit course" />
        <p className="text-sm text-destructive">{error}</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/educator-courses')}>Back</Button>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="pb-24">
      <PageHeader
        label="Create"
        title="Edit course"
        description="Update titles, lessons, and module quizzes. Changes apply immediately after save."
        actions={
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Save changes
          </Button>
        }
      />

      {status && <p className="mb-4 text-sm text-muted-foreground">{status}</p>}
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      <Card className="mb-6">
        <CardHeader><CardTitle>Course details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <select
              id="difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {form.modules.map((module, moduleIndex) => (
        <Card key={module.id} className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Module {moduleIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Module title</Label>
              <Input value={module.title} onChange={(e) => updateModule(moduleIndex, { title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Module description</Label>
              <textarea
                value={module.description ?? ''}
                onChange={(e) => updateModule(moduleIndex, { description: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Lessons</p>
              <div className="space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="flex gap-2">
                    <Input
                      value={lesson.title}
                      onChange={(e) => {
                        const lessons = [...module.lessons];
                        lessons[lessonIndex] = { ...lesson, title: e.target.value };
                        updateModule(moduleIndex, { lessons });
                      }}
                      className="flex-1"
                    />
                    <span className="flex items-center text-xs text-muted-foreground">{lesson.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Module quiz</p>
              <div className="space-y-4">
                {(module.quiz ?? []).map((question, quizIndex) => (
                  <div key={quizIndex} className="rounded-md border border-border p-3">
                    <div className="space-y-2">
                      <Label>Question {quizIndex + 1}</Label>
                      <Input
                        value={question.question}
                        onChange={(e) => updateQuiz(moduleIndex, quizIndex, { question: e.target.value })}
                      />
                    </div>
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${module.id}-${quizIndex}`}
                            checked={question.answer === optionIndex}
                            onChange={() => updateQuiz(moduleIndex, quizIndex, { answer: optionIndex })}
                          />
                          <Input
                            value={option}
                            onChange={(e) => {
                              const options = [...question.options];
                              options[optionIndex] = e.target.value;
                              updateQuiz(moduleIndex, quizIndex, { options });
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      {question.options.length < 4 && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => addQuizOption(moduleIndex, quizIndex)}>
                          <Plus size={14} /> Add option
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-6 py-4 backdrop-blur lg:left-[240px]">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Button variant="outline" onClick={() => navigate(courseId ? `/course-details/${courseId}` : '/educator-courses')}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function axiosMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    return data?.message ?? null;
  }
  return null;
}
