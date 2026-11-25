import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { useUserProfile } from '../context/UserProfileContext';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { getDisplayName } from '../utils/userDisplay';
import { AppSidebar } from './AppSidebar';
import { CUBIT_LOGO } from '../cubit/subjects';

function AppMark() {
  return (
    <img
      src={CUBIT_LOGO}
      alt="Cubit"
      width={30}
      height={30}
      className="size-[30px] shrink-0 object-contain"
    />
  );
}

export function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { profile, loading: profileLoading } = useUserProfile();
  const [navOpen, setNavOpen] = useState(false);
  const displayName = getDisplayName(profile);

  const goProfile = () => {
    setNavOpen(false);
    navigate('/settings');
  };

  return (
    <>
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)] min-[981px]:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          showClose={false}
          overlayClassName="z-[60]"
          className="z-[60] flex w-[min(300px,88vw)] flex-col p-0"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex shrink-0 items-center border-b border-[var(--border)]">
            <button
              type="button"
              onClick={goProfile}
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--fill)]"
            >
              <UserAvatar profile={profile} size="md" variant="default" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-[var(--ink)]">
                  {displayName || (profileLoading ? 'Loading…' : 'Your profile')}
                </p>
                <p className="text-[12px] text-[var(--ink-soft)]">Profile & settings</p>
              </div>
            </button>
            <SheetClose asChild>
              <button
                type="button"
                className="mr-1 flex size-11 shrink-0 items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </SheetClose>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <AppSidebar
              pathname={location.pathname}
              search={location.search}
              layout="drawer"
              onNavigate={() => setNavOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Link to="/dashboard" className="flex min-w-0 shrink items-center gap-2 no-underline" aria-label="Cubit">
        <AppMark />
      </Link>

      <div className="min-w-0 flex-1" />

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-10 items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </>
  );
}
