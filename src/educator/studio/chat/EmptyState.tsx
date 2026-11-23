import { StudentMasterInput } from '../../../components/StudentMasterInput';

export function EmptyState({ onSubmit }: { onSubmit: (url: string) => void }) {
  return (
    <div data-testid="studio-empty" className="studio-empty">
      <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[var(--ink)]">What should Cubit AI turn into a course?</h2>
      <div className="mt-5 text-left">
        <StudentMasterInput
          lockMode="course"
          onCourseSubmit={onSubmit}
          inputTestId="composer-input"
          submitTestId="composer-send"
        />
      </div>
    </div>
  );
}
