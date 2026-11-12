import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { PageTransition } from './motion';
import { ShellProvider } from './ShellContext';
import { isCourseEditorRoute, isEducatorWorkspaceRoute } from '../utils/editorWorkspace';
import { cn } from '../components/ui/utils';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount } from '../utils/signInIntent';
import { billingPlanLabel, hidesUpgradeCta } from '../api/billingApi';
import { useShell } from './ShellContext';

/** Mobile-only — desktop upgrade chip lives in the sidebar under Settings. */
function MobileUpgradeFab() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { billing } = useShell();
  if (!profile || isAdminAccount(profile)) return null;
  if (billing && hidesUpgradeCta(billing)) return null;

  return (
    <div className="cuib-upgrade-fab">
      <span className="text-[12.5px] font-semibold text-[var(--ink-soft)]">
        {billingPlanLabel(billing, false)}
      </span>
      <button
        type="button"
        onClick={() => navigate('/upgrade')}
        className="rounded-full bg-[var(--accent)] px-4 py-[9px] text-[12.5px] font-bold text-white transition-opacity hover:opacity-[0.88] active:scale-95"
      >
        Upgrade
      </button>
    </div>
  );
}

function AppShellLayout() {
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useShell();
  const educatorWorkspace = isEducatorWorkspaceRoute(location.pathname);
  const courseEditor = isCourseEditorRoute(location.pathname);

  if (courseEditor) {
    return (
      <div className="cuib-app flex h-dvh flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="cuib-app min-h-screen">
      <header className="cuib-topnav sticky top-0 z-50">
        <AppTopbar />
      </header>

      <div
        className={cn(
          'cuib-shell',
          educatorWorkspace && '!grid-cols-1',
          !educatorWorkspace && sidebarCollapsed && 'cuib-shell--sidebar-collapsed',
        )}
      >
        {!educatorWorkspace && (
          <aside className="cuib-sidebar">
            <AppSidebar pathname={location.pathname} search={location.search} />
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="cuib-sidebar-edge-toggle"
              aria-expanded={!sidebarCollapsed}
              aria-controls="cuib-sidebar-nav"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight size={14} strokeWidth={2.2} />
              ) : (
                <ChevronLeft size={14} strokeWidth={2.2} />
              )}
            </button>
          </aside>
        )}
        <main className="cuib-main">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {!educatorWorkspace && <MobileUpgradeFab />}
    </div>
  );
}

export function AppShell() {
  return (
    <ShellProvider>
      <AppShellLayout />
    </ShellProvider>
  );
}
