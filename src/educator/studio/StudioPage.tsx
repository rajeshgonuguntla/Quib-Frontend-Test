import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useUserProfile } from '../../context/UserProfileContext';
import { useRequireStudioV2 } from '../../hooks/useRequireStudioV2';
import '../../styles/studio.css';
import { StudioLayout } from './StudioLayout';
import { StudioTopBar } from './StudioTopBar';
import { readChatCollapsed, writeChatCollapsed } from './useChatCollapsed';

/** Static stand-in until course data is wired. The seeded thread uses this title. */
const SEEDED_TITLE = 'SAT Math Sprint';

export function StudioPage() {
  useRequireStudioV2();
  const { courseId } = useParams();
  const { profile } = useUserProfile();
  const userId = profile?.id;
  const isEmpty = !courseId;
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setCollapsed(readChatCollapsed(userId));
    setHydrated(true);
  }, [userId]);

  const persist = useCallback((next: boolean) => {
    setCollapsed(next);
    if (userId) writeChatCollapsed(userId, next);
  }, [userId]);

  return (
    <div data-testid="studio" className="studio">
      <StudioTopBar title={isEmpty ? 'New course' : SEEDED_TITLE} published={!isEmpty} />
      <StudioLayout
        isEmpty={isEmpty}
        collapsed={collapsed}
        showToggle={!isEmpty && hydrated}
        onToggle={() => persist(!collapsed)}
        onExpand={() => persist(false)}
      >
        {isEmpty ? (
          <div data-testid="studio-empty" className="studio-empty">
            <p className="text-[15px] font-semibold text-[var(--ink)]">New course</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
              Chat for this course will show up here.
            </p>
          </div>
        ) : null}
      </StudioLayout>
    </div>
  );
}
