import { PageHeader } from '../shell/PageHeader';
import { StandaloneNotesWorkspace } from './StandaloneNotesWorkspace';

export function NotesPage() {
  return (
    <div>
      <PageHeader
        title="Notes"
        description="Drafts save on this device. Pick a note below to switch between them."
      />
      <StandaloneNotesWorkspace libraryLayout="below" />
    </div>
  );
}
