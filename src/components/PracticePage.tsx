import { PageHeader } from '../shell/PageHeader';
import { StudentMasterInput } from './StudentMasterInput';

export function PracticePage() {
  return (
    <div>
      <PageHeader
        title="Practice"
        description="Generate a quiz from a topic or a YouTube URL."
      />
      <StudentMasterInput lockMode="quiz" />
    </div>
  );
}
