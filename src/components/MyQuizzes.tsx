import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { FileText, Play, Clock, Calendar, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { StaggerChildren, StaggerItem } from '../shell/motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Skeleton } from './ui/skeleton';

type QuizListItem = {
  id: string;
  title: string;
  status: string;
  score: number | null;
  date: string;
  duration: string;
  questions: number;
  progress?: number;
};

export function MyQuizzes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [allQuizzes, setAllQuizzes] = useState<QuizListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/quizzes');
        const mapped: QuizListItem[] = (res.data ?? []).map((q: {
          id: string;
          title: string;
          status: string;
          latestScorePercent?: number;
          questionCount?: number;
          durationLabel?: string;
          createdAt?: string;
        }) => ({
          id: q.id,
          title: q.title,
          status: q.status === 'in_progress' ? 'in-progress' : q.status,
          score: q.latestScorePercent ?? null,
          date: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '',
          duration: q.durationLabel ?? '--',
          questions: q.questionCount ?? 0,
        }));
        setAllQuizzes(mapped);
      } catch {
        setAllQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredQuizzes = allQuizzes.filter((quiz) => {
    if (activeTab === 'active') return quiz.status === 'in-progress' || quiz.status === 'generated';
    if (activeTab === 'completed') return quiz.status === 'completed';
    return true;
  });

  const stats = {
    total: allQuizzes.length,
    active: allQuizzes.filter((q) => q.status === 'in-progress' || q.status === 'generated').length,
    completed: allQuizzes.filter((q) => q.status === 'completed').length,
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: FileText },
    { label: 'Active', value: stats.active, icon: AlertCircle },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2 },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader label="Library" title="Saved quizzes" description="Loading…" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        label="Library"
        title="Saved quizzes"
        description="Manage and track all your quizzes."
        actions={
          <Button size="sm" onClick={() => navigate('/dashboard')}>
            <Zap size={14} /> New quiz
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-3 gap-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                <s.icon size={16} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-medium tabular-nums">{s.value}</p>
                <p className="text-label text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({allQuizzes.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredQuizzes.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No quizzes found.</p>
            <Button className="mt-4" size="sm" onClick={() => navigate('/dashboard')}>Create quiz</Button>
          </CardContent>
        </Card>
      ) : (
        <StaggerChildren className="space-y-2">
          {filteredQuizzes.map((quiz) => (
            <StaggerItem key={quiz.id}>
              <Card className="transition-colors hover:border-border/80">
                <CardContent className="flex gap-4 p-4">
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Play size={20} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="truncate text-sm font-medium">{quiz.title}</h3>
                      <Badge variant="muted">{quiz.status.replace('-', ' ')}</Badge>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={12} />{quiz.date}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{quiz.duration}</span>
                      <span className="flex items-center gap-1"><FileText size={12} />{quiz.questions} questions</span>
                    </div>
                    <div className="flex gap-2">
                      {quiz.status === 'completed' ? (
                        <Button size="sm" variant="default" onClick={() => navigate(`/results/${quiz.id}`)}>View results</Button>
                      ) : (
                        <Button size="sm" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                          {quiz.status === 'in-progress' ? 'Resume' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
