import { StudentMasterInput } from '../../../components/StudentMasterInput';

export function EmptyState({ onSubmit }: { onSubmit: (url: string) => void }) {
  return (
    <div data-testid="studio-empty" className="studio-empty">
      <StudentMasterInput
        onCourseSubmit={onSubmit}
        inputTestId="composer-input"
        submitTestId="composer-send"
      />
    </div>
  );
}
