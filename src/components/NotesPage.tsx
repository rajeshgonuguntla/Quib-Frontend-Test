import { PageHeader } from '../shell/PageHeader';
import { StandaloneNotesWorkspace } from './StandaloneNotesWorkspace';

export function NotesPage() {
  return (
    <div>
      <PageHeader
        title="Notes"
        description="Drafts save on this device. Open My notes to switch between them."
      />
      <StandaloneNotesWorkspace />
    </div>
  );
}
