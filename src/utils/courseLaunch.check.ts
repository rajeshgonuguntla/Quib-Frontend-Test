import { hasCourseProgress, markCourseLaunched, wasCourseLaunched } from './courseLaunch';

// ponytail: assert-based self-check — fails if launch flag / progress detection breaks.
function check() {
  const id = '__cuib_launch_selfcheck__';
  try {
    localStorage.removeItem(`cuib:course-launched:${id}`);
  } catch {
    return;
  }
  if (wasCourseLaunched(id)) throw new Error('expected not launched');
  markCourseLaunched(id);
  if (!wasCourseLaunched(id)) throw new Error('expected launched');
  if (!hasCourseProgress({ progressPercent: 12 })) throw new Error('progress percent');
  if (hasCourseProgress({ progressPercent: 0, completedLessons: 0, completedLessonIds: [] })) {
    throw new Error('empty progress should be false');
  }
  try {
    localStorage.removeItem(`cuib:course-launched:${id}`);
  } catch {
    /* ignore */
  }
}

check();
