import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Moon, Sun, UserRound } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import { UserAvatar } from '../components/UserAvatar';
import { useUserProfile } from '../context/UserProfileContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { billingPlanLabel, hidesUpgradeCta } from '../api/billingApi';
import { clearToken } from '../auth';
import { clearSignInIntent, isAdminAccount } from '../utils/signInIntent';
import { getDisplayName, getFirstName } from '../utils/userDisplay';
import { AppSidebar } from './AppSidebar';
import { useShell } from './ShellContext';

function AppMark() {
  return (
    <div
      className="flex size-[30px] shrink-0 items-center justify-center rounded-lg"
      style={{ background: 'var(--ink)' }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    </div>
  );
}

export function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { profile, loading: profileLoading, setProfile } = useUserProfile();
  const { billing } = useShell();
  const [navOpen, setNavOpen] = useState(false);
  const isAdmin = isAdminAccount(profile);
  const hideUpgrade = !profile || isAdmin || (billing != null && hidesUpgradeCta(billing));
  const firstName = getFirstName(profile);
  const displayName = getDisplayName(profile);
  const planLabel = billingPlanLabel(billing, isAdmin);

  const handleSignOut = () => {
    clearToken();
    clearSignInIntent();
    setProfile(null);
    navigate('/signin');
  };

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
        <SheetContent side="left" className="flex w-[min(300px,88vw)] flex-col p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <button
            type="button"
            onClick={goProfile}
            className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-4 py-4 text-left transition-colors hover:bg-[var(--fill)]"
          >
            <UserAvatar profile={profile} size="md" variant="default" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[var(--ink)]">
                {displayName || (profileLoading ? 'Loading…' : 'Your profile')}
              </p>
              <p className="text-[12px] text-[var(--ink-soft)]">Profile & settings</p>
            </div>
            <UserRound size={16} className="shrink-0 text-[var(--ink-faint)]" aria-hidden />
          </button>
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

      <Link to="/dashboard" className="flex min-w-0 shrink items-center gap-2 no-underline">
        <AppMark />
        <span
          className="truncate text-[15px] font-extrabold tracking-[-0.02em] text-[var(--ink)]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Cuib
        </span>
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

        <DropdownMenu modal>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--fill)] outline-none transition-colors hover:border-[var(--ink-faint)]"
              aria-label="Open profile menu"
            >
              <UserAvatar profile={profile} size="md" variant="default" className="size-full" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-[80] w-[220px] rounded-xl border-[var(--border)] bg-[var(--surface)] p-2 text-[var(--ink)] shadow-[var(--shadow)]"
          >
            <div className="flex items-center justify-between gap-2.5 rounded-[10px] px-2 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <UserAvatar profile={profile} size="md" variant="default" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold leading-snug">
                    {firstName || (profileLoading ? 'Loading…' : 'Account')}
                  </p>
                  <p className="text-[11px] text-[var(--ink-faint)]">{planLabel}</p>
                </div>
              </div>
              {!hideUpgrade && (
                <button
                  type="button"
                  onClick={() => navigate('/upgrade')}
                  className="shrink-0 text-[11px] font-semibold text-[var(--accent)] hover:opacity-65"
                >
                  Upgrade
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-[13px]">
              Profile & settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-[11.5px] text-[var(--ink-faint)] focus:text-[var(--ink)]"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
