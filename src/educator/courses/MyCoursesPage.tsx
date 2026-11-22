import { useRequireStudioV2 } from '../../hooks/useRequireStudioV2';
import { PageHeader } from '../../shell/PageHeader';

/** Route placeholder. PR-04 fills in the course list. */
export function MyCoursesPage() {
  useRequireStudioV2();

  return <PageHeader title="My courses" />;
}
