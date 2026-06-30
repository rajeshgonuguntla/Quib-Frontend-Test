import { Outlet, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { PageTransition } from './motion';
import { ShellProvider } from './ShellContext';
import { isCourseEditorRoute, isEducatorWorkspaceRoute } from '../utils/editorWorkspace';
import { cn } from '../components/ui/utils';

export function AppShell() {
  const location = useLocation();
  const educatorWorkspace = isEducatorWorkspaceRoute(location.pathname);
  const courseEditor = isCourseEditorRoute(location.pathname);

  return (
    <ShellProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Vercel-style subtle grid */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.35] dark:opacity-[0.12]"
          style={{
            backgroundImage: 'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 70%)',
          }}
        />
        {!educatorWorkspace && (
          <aside className="fixed inset-y-0 left-0 z-50 hidden w-[240px] border-r border-border bg-sidebar lg:flex lg:flex-col">
            <AppSidebar pathname={location.pathname} search={location.search} />
          </aside>
        )}

        <div className={cn('flex min-h-screen flex-col', !educatorWorkspace && 'lg:ml-[240px]')}>
          <AppTopbar />
          <main
            className={cn(
              'flex-1',
              courseEditor ? 'overflow-hidden p-0' : 'px-4 py-6 sm:px-6 sm:py-8',
            )}
          >
            {courseEditor ? (
              <div className="h-[calc(100dvh-3.5rem)] w-full">
                <Outlet />
              </div>
            ) : (
              <div className="mx-auto w-full max-w-6xl">
                <AnimatePresence mode="wait">
                  <PageTransition key={location.pathname}>
                    <Outlet />
                  </PageTransition>
                </AnimatePresence>
              </div>
            )}
          </main>
        </div>
      </div>
    </ShellProvider>
  );
}
