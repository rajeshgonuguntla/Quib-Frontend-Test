import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sun, Moon } from 'lucide-react';
import { clearToken, isTokenValid } from '../auth';
import { useUserProfile } from '../context/UserProfileContext';
import { UserAvatar } from './UserAvatar';
import { getDisplayName } from '../utils/userDisplay';
import { clearSignInIntent } from '../utils/signInIntent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type ThemeColors = ReturnType<typeof import('./ThemeContext').getC>;

type CoursePageNavProps = {
  C: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  navBg: string;
  left?: ReactNode;
  center?: ReactNode;
};

export function CoursePageNav({
  C,
  isDark,
  toggleTheme,
  navBg,
  left,
  center,
}: CoursePageNavProps) {
  const navigate = useNavigate();
  const { profile, setProfile } = useUserProfile();
  const signedIn = isTokenValid();

  const handleSignOut = () => {
    clearToken();
    clearSignInIntent();
    setProfile(null);
    navigate('/signin');
  };

  const defaultCenter = (
    <ul className="hidden md:flex gap-7 list-none">
      <li>
        <Link
          to="/"
          className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100"
          style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}
        >
          Platform
        </Link>
      </li>
      {signedIn ? (
        <li>
          <Link
            to="/dashboard"
            className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100"
            style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}
          >
            Dashboard
          </Link>
        </li>
      ) : (
        <li>
          <Link
            to="/signin"
            className="text-[0.875rem] font-[400] no-underline transition-opacity hover:opacity-100"
            style={{ color: C.text2, letterSpacing: '0.01em', opacity: 0.8 }}
          >
            Sign in
          </Link>
        </li>
      )}
    </ul>
  );

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 md:px-10"
      style={{
        height: 56,
        background: navBg,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div className="flex items-center gap-4 min-w-0">{left}</div>

      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        {center ?? defaultCenter}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${C.border}`,
            color: C.text2,
            cursor: 'pointer',
          }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {signedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Account menu"
              >
                <UserAvatar profile={profile} size="md" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{getDisplayName(profile)}</p>
                <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/my-courses')}>My courses</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/signin"
            className="md:hidden px-3 py-1.5 rounded-lg text-[0.78rem] font-[600] no-underline"
            style={{ background: C.red, color: '#fff' }}
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
