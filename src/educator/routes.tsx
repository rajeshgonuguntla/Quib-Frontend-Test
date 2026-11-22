import { lazy } from 'react';
import { Navigate, Route, useParams } from 'react-router';

const StudioPage = lazy(() =>
  import('./studio/StudioPage').then((mod) => ({ default: mod.StudioPage })),
);
const MyCoursesPage = lazy(() =>
  import('./courses/MyCoursesPage').then((mod) => ({ default: mod.MyCoursesPage })),
);

function RedirectCourseEditor() {
  const { courseId } = useParams();
  return <Navigate to={`/educator-studio/${courseId ?? ''}`} replace />;
}

/** Registered only when `STUDIO_V2_ENABLED` is on. */
export function educatorRoutes() {
  return (
    <>
      <Route path="/educator-studio" element={<StudioPage />} />
      <Route path="/educator-studio/:courseId" element={<StudioPage />} />
      <Route path="/educator-courses" element={<MyCoursesPage />} />
      <Route path="/educator-courses/:courseId/edit" element={<RedirectCourseEditor />} />
      <Route path="/educator-analytics" element={<Navigate to="/educator-courses" replace />} />
    </>
  );
}
