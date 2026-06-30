import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { updateCourse } from '../api/educatorApi';
import {
  COURSE_CATEGORIES,
  CONTENT_LANGUAGES,
  type CourseLesson,
  type CourseModule,
  type CourseQuizQuestion,
  type EditableCourse,
  type PlaylistVideo,
  nextLessonId,
  nextModuleId,
} from '../types/courseGeneration';
import { PageHeader } from '../shell/PageHeader';
import { useRequireEducatorExperience } from '../hooks/useRequireEducatorExperience';
import { useAuthSessionKey } from '../auth';
import { EducatorAssistantWidget } from './EducatorAssistantWidget';
import type { CourseUpdatePayload } from '../types/courseGeneration';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function CourseEditor() {
  useRequireEducatorExperience();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const authSessionKey = useAuthSessionKey();
  const [form, setForm] = useState<EditableCourse | null>(null);
  const [includedVideoIds, setIncludedVideoIds] = useState<Set<string>>(new Set());
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const playlistVideos = form?.playlistVideos ?? [];

  useEffect(() => {
    if (!courseId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<
          EditableCourse & { modules: CourseModule[]; playlistVideos?: PlaylistVideo[]; isOwner?: boolean }
        >(`/api/course/${courseId}`);
        if (!mounted) return;
        if (!data.isOwner) {
          setError('You can only edit courses you created.');
          return;
        }
        const videos = data.playlistVideos ?? [];
        let loadedForm: EditableCourse = {
          title: data.title ?? '',
          description: data.description ?? '',
          difficulty: data.difficulty ?? 'Intermediate',
          category: data.category ?? 'General',
          contentLanguage: data.contentLanguage ?? 'en',
          modules: data.modules ?? [],
          playlistVideos: videos,
        };
        let videoIds = new Set(videos.map((v) => v.videoId).filter(Boolean));
        const pendingKey = `assistant-pending-${courseId}`;
        const pendingRaw = sessionStorage.getItem(pendingKey);
        if (pendingRaw) {
          try {
            const pending = JSON.parse(pendingRaw) as CourseUpdatePayload;
            sessionStorage.removeItem(pendingKey);
            loadedForm = mergeAssistantUpdate(loadedForm, pending);
            if (pending.includedVideoIds?.length) {
              videoIds = new Set(pending.includedVideoIds);
            }
            setStatus('Applied AI changes from assistant — review and save.');
          } catch {
            sessionStorage.removeItem(pendingKey);
          }
        }
        setForm(loadedForm);
        setIncludedVideoIds(videoIds);
      } catch {
        if (mounted) setError('Could not load course for editing.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [courseId]);

  const activeVideos = useMemo(
    () => playlistVideos.filter((v) => includedVideoIds.has(v.videoId)),
    [playlistVideos, includedVideoIds],
  );

  const updateModule = (index: number, patch: Partial<CourseModule>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      modules[index] = { ...modules[index], ...patch };
      return { ...prev, modules };
    });
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, patch: Partial<CourseLesson>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      const lessons = [...modules[moduleIndex].lessons];
      lessons[lessonIndex] = { ...lessons[lessonIndex], ...patch };
      modules[moduleIndex] = { ...modules[moduleIndex], lessons };
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

  const addModule = () => {
    setForm((prev) => {
      if (!prev) return prev;
      const id = nextModuleId(prev.modules);
      return {
        ...prev,
        modules: [
          ...prev.modules,
          { id, title: `Module ${prev.modules.length + 1}`, description: '', lessons: [], quiz: [] },
        ],
      };
    });
  };

  const removeModule = (index: number) => {
    setForm((prev) => {
      if (!prev || prev.modules.length <= 1) return prev;
      const modules = prev.modules.filter((_, i) => i !== index);
      return { ...prev, modules };
    });
  };

  const moveModule = (index: number, direction: -1 | 1) => {
    setForm((prev) => {
      if (!prev) return prev;
      return { ...prev, modules: moveItem(prev.modules, index, index + direction) };
    });
  };

  const addLesson = (moduleIndex: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      const id = nextLessonId(prev.modules);
      const lessons = [
        ...modules[moduleIndex].lessons,
        { id, title: 'New lesson', duration: '5 min', type: 'reading' as const },
      ];
      modules[moduleIndex] = { ...modules[moduleIndex], lessons };
      return { ...prev, modules };
    });
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      const lessons = modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
      if (lessons.length === 0) return prev;
      modules[moduleIndex] = { ...modules[moduleIndex], lessons };
      return { ...prev, modules };
    });
  };

  const moveLesson = (moduleIndex: number, lessonIndex: number, direction: -1 | 1) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons: moveItem(modules[moduleIndex].lessons, lessonIndex, lessonIndex + direction),
      };
      return { ...prev, modules };
    });
  };

  const addQuizQuestion = (moduleIndex: number) => {
    setForm((prev) => {
      if (!prev) return prev;
      const modules = [...prev.modules];
      const quiz = [...(modules[moduleIndex].quiz ?? [])];
      quiz.push({
        question: 'New question',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
      });
      modules[moduleIndex] = { ...modules[moduleIndex], quiz };
      return { ...prev, modules };
    });
  };

  const toggleVideo = (videoId: string) => {
    setIncludedVideoIds((prev) => {
      const next = new Set(prev);
      if (next.has(videoId)) next.delete(videoId);
      else next.add(videoId);
      return next;
    });
  };

  const assignVideoToLesson = (moduleIndex: number, lessonIndex: number, video: PlaylistVideo) => {
    updateLesson(moduleIndex, lessonIndex, {
      type: 'video',
      title: video.title,
      duration: video.duration || '—',
      videoId: video.videoId,
      videoUrl: video.videoUrl,
    });
  };

  const applyAssistantUpdate = (update: CourseUpdatePayload) => {
    setForm((prev) => (prev ? mergeAssistantUpdate(prev, update) : prev));
    if (update.includedVideoIds?.length) {
      setIncludedVideoIds(new Set(update.includedVideoIds));
    }
    setStatus('AI changes applied — review the editor and click Save.');
  };

  const handleSave = async () => {
    if (!courseId || !form) return;
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const { playlistVideos: _pv, ...payload } = form;
      await updateCourse(courseId, {
        ...payload,
        includedVideoIds: [...includedVideoIds],
      });
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
        description="Update structure, lessons, videos, notes, and quizzes. Save re-links videos automatically."
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
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
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
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category ?? 'General'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {COURSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentLanguage">Language</Label>
            <select
              id="contentLanguage"
              value={form.contentLanguage ?? 'en'}
              onChange={(e) => setForm({ ...form, contentLanguage: e.target.value })}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              {CONTENT_LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      {playlistVideos.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Source videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Include or exclude videos from the course. Included videos can be assigned to lessons below.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {playlistVideos.map((video) => {
                const on = includedVideoIds.has(video.videoId);
                return (
                  <button
                    key={video.videoId}
                    type="button"
                    onClick={() => toggleVideo(video.videoId)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                      on ? 'border-[var(--brand)] bg-[var(--brand)]/5' : 'border-border'
                    }`}
                  >
                    <span className={`mt-0.5 size-4 shrink-0 rounded border ${on ? 'bg-[var(--brand)] border-[var(--brand)]' : 'border-muted-foreground'}`} />
                    <span>
                      <span className="font-medium line-clamp-2">{video.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{video.duration}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{activeVideos.length} of {playlistVideos.length} videos included</p>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium">Modules ({form.modules.length})</h2>
        <Button type="button" size="sm" variant="outline" onClick={addModule}>
          <Plus size={14} /> Add module
        </Button>
      </div>

      {form.modules.map((module, moduleIndex) => (
        <Card key={module.id} className="mb-4">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <CardTitle className="text-base">Module {moduleIndex + 1}</CardTitle>
            <div className="flex shrink-0 gap-1">
              <Button type="button" size="icon" variant="ghost" disabled={moduleIndex === 0} onClick={() => moveModule(moduleIndex, -1)}>
                <ChevronUp size={14} />
              </Button>
              <Button type="button" size="icon" variant="ghost" disabled={moduleIndex === form.modules.length - 1} onClick={() => moveModule(moduleIndex, 1)}>
                <ChevronDown size={14} />
              </Button>
              <Button type="button" size="icon" variant="ghost" disabled={form.modules.length <= 1} onClick={() => removeModule(moduleIndex)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
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
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Lessons</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => addLesson(moduleIndex)}>
                  <Plus size={14} /> Add lesson
                </Button>
              </div>
              <div className="space-y-3">
                {module.lessons.map((lesson, lessonIndex) => {
                  const lessonKey = `${module.id}-${lesson.id}`;
                  const isOpen = expandedLesson === lessonKey;
                  return (
                    <div key={lesson.id} className="rounded-md border border-border">
                      <div className="flex items-center gap-2 p-3">
                        <GripVertical size={14} className="shrink-0 text-muted-foreground" />
                        <Input
                          value={lesson.title}
                          onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                          className="flex-1"
                        />
                        <select
                          value={lesson.type}
                          onChange={(e) => updateLesson(moduleIndex, lessonIndex, {
                            type: e.target.value as 'video' | 'reading',
                            ...(e.target.value === 'reading' ? { videoId: undefined, videoUrl: undefined } : {}),
                          })}
                          className="h-9 rounded-md border border-border bg-background px-2 text-xs"
                        >
                          <option value="video">Video</option>
                          <option value="reading">Reading</option>
                        </select>
                        <Button type="button" size="icon" variant="ghost" disabled={lessonIndex === 0} onClick={() => moveLesson(moduleIndex, lessonIndex, -1)}>
                          <ChevronUp size={14} />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" disabled={lessonIndex === module.lessons.length - 1} onClick={() => moveLesson(moduleIndex, lessonIndex, 1)}>
                          <ChevronDown size={14} />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" onClick={() => setExpandedLesson(isOpen ? null : lessonKey)}>
                          <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" disabled={module.lessons.length <= 1} onClick={() => removeLesson(moduleIndex, lessonIndex)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                      {isOpen && (
                        <div className="space-y-3 border-t border-border p-3">
                          {lesson.type === 'video' && activeVideos.length > 0 && (
                            <div className="space-y-2">
                              <Label>Assign video</Label>
                              <div className="flex flex-wrap gap-2">
                                {activeVideos.map((v) => (
                                  <Button
                                    key={v.videoId}
                                    type="button"
                                    size="sm"
                                    variant={lesson.videoId === v.videoId ? 'default' : 'outline'}
                                    onClick={() => assignVideoToLesson(moduleIndex, lessonIndex, v)}
                                  >
                                    {v.title.length > 40 ? `${v.title.slice(0, 40)}…` : v.title}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label>Summary</Label>
                            <textarea
                              value={lesson.summary ?? ''}
                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { summary: e.target.value })}
                              rows={3}
                              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Study notes (markdown)</Label>
                            <textarea
                              value={lesson.notes ?? ''}
                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { notes: e.target.value })}
                              rows={8}
                              placeholder="### Core concept&#10;&#10;Write markdown study notes…"
                              className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-xs"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Takeaway</Label>
                            <Input
                              value={lesson.takeaway ?? ''}
                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, { takeaway: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Module quiz</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => addQuizQuestion(moduleIndex)}>
                  <Plus size={14} /> Add question
                </Button>
              </div>
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

      {courseId && (
        <EducatorAssistantWidget
          courseId={courseId}
          courseTitle={form.title}
          sessionKey={authSessionKey}
          onApplyCourseUpdate={applyAssistantUpdate}
        />
      )}
    </div>
  );
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

function axiosMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    return data?.message ?? null;
  }
  return null;
}
