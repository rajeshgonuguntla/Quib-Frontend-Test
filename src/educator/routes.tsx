import { lazy, type ReactNode } from 'react';
import { Navigate, Route, useParams } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount } from '../utils/signInIntent';

const StudioPage = lazy(() =>
  import('./studio/StudioPage').then((mod) => ({ default: mod.StudioPage })),
);
const MyCoursesPage = lazy(() =>
  import('./courses/MyCoursesPage').then((mod) => ({ default: mod.MyCoursesPage })),
);
const EducatorStudio = lazy(() =>
  import('../components/EducatorStudio').then((mod) => ({ default: mod.EducatorStudio })),
);
const EducatorMyCourses = lazy(() =>
  import('../components/EducatorMyCourses').then((mod) => ({ default: mod.EducatorMyCourses })),
);
const EducatorAnalytics = lazy(() =>
  import('../components/EducatorAnalytics').then((mod) => ({ default: mod.EducatorAnalytics })),
);
const CourseEditor = lazy(() =>
  import('../components/CourseEditor').then((mod) => ({ default: mod.CourseEditor })),
);

/** Postgres `users.role = admin` sees Cubit Studio. Everyone else keeps today's screens. */
function WhenAdmin({ admin, legacy }: { admin: ReactNode; legacy: ReactNode }) {
  const { profile, loading } = useUserProfile();
  if (loading) return null;
  return isAdminAccount(profile) ? admin : legacy;
}

function StudioCourseEntry() {
  const { courseId } = useParams();
  return (
    <WhenAdmin
      admin={<StudioPage />}
      legacy={<Navigate to={`/educator-courses/${courseId ?? ''}/edit`} replace />}
    />
  );
}

function CourseEditorEntry() {
  const { courseId } = useParams();
  return (
    <WhenAdmin
      admin={<Navigate to={`/educator-studio/${courseId ?? ''}`} replace />}
      legacy={<CourseEditor />}
    />
  );
}

export function CourseBuilderRedirect() {
  return (
    <WhenAdmin
      admin={<Navigate to="/educator-studio" replace />}
      legacy={<Navigate to="/educator-studio?tab=url" replace />}
    />
  );
}

export function educatorRoutes() {
  return (
    <>
      <Route path="/educator-studio" element={<WhenAdmin admin={<StudioPage />} legacy={<EducatorStudio />} />} />
      <Route path="/educator-studio/:courseId" element={<StudioCourseEntry />} />
      <Route path="/educator-courses" element={<WhenAdmin admin={<MyCoursesPage />} legacy={<EducatorMyCourses />} />} />
      <Route path="/educator-courses/published" element={<WhenAdmin admin={<MyCoursesPage variant="published" />} legacy={<Navigate to="/educator-courses" replace />} />} />
      <Route path="/educator-courses/:courseId/edit" element={<CourseEditorEntry />} />
      <Route
        path="/educator-analytics"
        element={<WhenAdmin admin={<Navigate to="/educator-courses" replace />} legacy={<EducatorAnalytics />} />}
      />
    </>
  );
}
