import { lazy, type ReactNode } from 'react';
import { Navigate, Route, useParams } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isEducatorAccount } from '../utils/signInIntent';

const StudioPage = lazy(() =>
  import('./studio/StudioPage').then((mod) => ({ default: mod.StudioPage })),
);
const MyCoursesPage = lazy(() =>
  import('./courses/MyCoursesPage').then((mod) => ({ default: mod.MyCoursesPage })),
);
function LearnerHome() {
  return <Navigate to="/dashboard" replace />;
}

/** Admins and educators see Cubit Studio. A learner goes to Home. */
function WhenAdmin({ admin, legacy }: { admin: ReactNode; legacy: ReactNode }) {
  const { profile, loading } = useUserProfile();
  if (loading) return null;
  return isEducatorAccount(profile) ? admin : legacy;
}

function StudioCourseEntry() {
  return (
    <WhenAdmin
      admin={<StudioPage />}
      legacy={<LearnerHome />}
    />
  );
}

function CourseEditorEntry() {
  const { courseId } = useParams();
  return (
    <WhenAdmin
      admin={<Navigate to={`/educator-studio/${courseId ?? ''}`} replace />}
      legacy={<LearnerHome />}
    />
  );
}

export function CourseBuilderRedirect() {
  return (
    <WhenAdmin
      admin={<Navigate to="/educator-studio" replace />}
      legacy={<LearnerHome />}
    />
  );
}

export function educatorRoutes() {
  return (
    <>
      <Route path="/educator-studio" element={<WhenAdmin admin={<StudioPage />} legacy={<LearnerHome />} />} />
      <Route path="/educator-studio/:courseId" element={<StudioCourseEntry />} />
      <Route path="/educator-courses" element={<WhenAdmin admin={<MyCoursesPage />} legacy={<LearnerHome />} />} />
      <Route path="/educator-courses/published" element={<WhenAdmin admin={<MyCoursesPage variant="published" />} legacy={<LearnerHome />} />} />
      <Route path="/educator-courses/:courseId/edit" element={<CourseEditorEntry />} />
      <Route
        path="/educator-analytics"
        element={<WhenAdmin admin={<Navigate to="/educator-courses" replace />} legacy={<LearnerHome />} />}
      />
    </>
  );
}
