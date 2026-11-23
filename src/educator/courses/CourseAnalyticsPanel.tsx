import { X } from 'lucide-react';
import analytics from './mock/course-analytics.sat-math-sprint.json';

export function CourseAnalyticsPanel({ title, draft, onClose }: { title: string; draft: boolean; onClose: () => void }) {
  if (draft) {
    return (
      <div data-testid="course-analytics-empty" className="border-t border-[var(--border)] px-4 py-6 text-[13px] text-[var(--ink-soft)]">
        No students yet. Publish this course to see analytics here.
        <button type="button" data-testid="course-analytics-close" aria-label="Close analytics" className="ml-3 text-[var(--ink)]" onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div data-testid="course-analytics" className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[var(--ink)]">{title}</p>
          <p className="mt-1 text-[12px] text-[var(--ink-soft)]">{analytics.meta}</p>
        </div>
        <button type="button" data-testid="course-analytics-close" aria-label="Close analytics" className="grid size-11 place-items-center text-[var(--ink-soft)]" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-label text-[10px] text-[var(--ink-faint)]">Weakest topics</p>
          <ul className="mt-2 space-y-2">
            {analytics.topics.map((topic) => (
              <li key={topic.name} data-testid="weak-topic">
                <div className="flex justify-between text-[12px] text-[var(--ink)]">
                  <span>{topic.name}</span>
                  <span data-accent={topic.weak ? 'analytics' : undefined} className={topic.weak ? 'font-[family-name:var(--mono)] text-[var(--accent)]' : 'font-[family-name:var(--mono)] text-[var(--ink-faint)]'}>{topic.pct}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-[var(--fill)]">
                  <div data-accent={topic.weak ? 'analytics' : undefined} className="h-1 rounded-full" style={{ width: `${topic.pct}%`, background: topic.weak ? 'var(--accent)' : 'var(--ink-faint)' }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-label text-[10px] text-[var(--ink-faint)]">Tutor questions</p>
          <ul className="mt-2">
            {analytics.tutorQuestions.map((row) => (
              <li key={row.q} data-testid="tutor-question" className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 text-[13px]">
                <span className="text-[var(--ink)]">{row.q}</span>
                <span data-accent="analytics" className="font-[family-name:var(--mono)] text-[12px] text-[var(--accent)]">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[12px]">
          <thead className="text-label text-[10px] text-[var(--ink-faint)]">
            <tr>
              <th className="py-2 font-medium">Student</th>
              <th className="py-2 font-medium">Progress</th>
              <th className="py-2 font-medium">Quiz</th>
              <th className="py-2 font-medium">Mock 1</th>
              <th className="py-2 font-medium">Weakest</th>
              <th className="py-2 font-medium">Tutor</th>
              <th className="py-2 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {analytics.students.map((student) => (
              <tr key={student.name} className="border-t border-[var(--border)] text-[var(--ink)]">
                <td className="py-2">{student.name}</td>
                <td className="py-2 font-[family-name:var(--mono)]">{student.progressPct}%</td>
                <td className="py-2 font-[family-name:var(--mono)]">{student.quizAvg}</td>
                <td className="py-2 font-[family-name:var(--mono)]">{student.mock1}</td>
                <td className="py-2">{student.weakestTopic}</td>
                <td className="py-2 font-[family-name:var(--mono)]">{student.tutorQuestions}</td>
                <td className="py-2">{student.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
