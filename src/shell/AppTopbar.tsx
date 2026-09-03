import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, Moon, Sun } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { billingPlanLabel, hidesUpgradeCta } from '../api/billingApi';
import { clearToken } from '../auth';
import { clearSignInIntent, isAdminAccount } from '../utils/signInIntent';
import { getFirstName } from '../utils/userDisplay';
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
  const { profile, setProfile } = useUserProfile();
  const { billing } = useShell();
  const isAdmin = isAdminAccount(profile);
  const hideUpgrade = !profile || isAdmin || (billing != null && hidesUpgradeCta(billing));
  const firstName = getFirstName(profile);
  const planLabel = billingPlanLabel(billing, isAdmin);

  const handleSignOut = () => {
    clearToken();
    clearSignInIntent();
    setProfile(null);
    navigate('/signin');
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className="flex size-[34px] items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)] min-[981px]:hidden"
            aria-label="Open navigation"
          >
            <Menu size={17} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[268px] p-0">
          <div className="p-4">
            <AppSidebar pathname={location.pathname} search={location.search} />
          </div>
        </SheetContent>
      </Sheet>

      <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5 no-underline">
        <AppMark />
        <span
          className="text-[15px] font-extrabold tracking-[-0.02em] text-[var(--ink)]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Cuib
        </span>
      </Link>

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          className="relative flex size-[34px] items-center justify-center rounded-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-[34px] items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--fill)] outline-none transition-colors hover:border-[var(--ink-faint)]"
              aria-label="Account menu"
            >
              <UserAvatar profile={profile} size="md" variant="mono" className="size-full" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[220px] rounded-xl border-[var(--border)] p-2 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between gap-2.5 rounded-[10px] px-2 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <UserAvatar profile={profile} size="md" variant="mono" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-snug">{firstName || 'Account'}</p>
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
            <DropdownMenuItem onClick={() => navigate('/settings')} className="text-[13px]">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-[11.5px] text-[var(--ink-faint)] focus:text-[var(--ink)]"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
