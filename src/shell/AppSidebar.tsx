import { useNavigate } from 'react-router';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { clearToken } from '../auth';
import { useUserProfile } from '../context/UserProfileContext';
import { SidebarNavItem } from '../components/SidebarNavItem';
import { UserAvatar } from '../components/UserAvatar';
import { getFirstName } from '../utils/userDisplay';
import { getShellTheme } from '../utils/shellTheme';
import { useTheme } from '../components/ThemeContext';
import { ScrollArea } from '../components/ui/scroll-area';
import { NAV_GROUPS, isNavItemActive, type NavItem } from './navConfig';
import { useShell } from './ShellContext';

type AppSidebarProps = {
  pathname: string;
  search: string;
  onNavigate?: () => void;
};

function NavGroupBlock({
  label,
  items,
  pathname,
  search,
  onNavigate,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  search: string;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const T = getShellTheme(isDark);
  const { libraryStats } = useShell();

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="mb-5">
      <p className="text-label mb-1.5 px-3 text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const badge = item.badgeKey ? String(libraryStats[item.badgeKey] || '0') : undefined;
          return (
            <SidebarNavItem
              key={item.id}
              theme={T}
              item={{ ...item, badge }}
              active={isNavItemActive(pathname, search, item.id, item.path)}
              onClick={() => go(item.path)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function AppSidebar({ pathname, search, onNavigate }: AppSidebarProps) {
  const navigate = useNavigate();
  const { profile, setProfile } = useUserProfile();
  const firstName = getFirstName(profile);

  const handleSignOut = () => {
    clearToken();
    setProfile(null);
    navigate('/signin');
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md border border-border bg-background">
          <GraduationCap size={14} className="text-foreground" />
        </div>
        <div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Quib</span>
          <span className="text-label -mt-0.5 block text-muted-foreground">Platform</span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        {NAV_GROUPS.map((group) => (
          <NavGroupBlock
            key={group.label}
            label={group.label}
            items={group.items}
            pathname={pathname}
            search={search}
            onNavigate={onNavigate}
          />
        ))}
      </ScrollArea>

      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={() => { navigate('/settings'); onNavigate?.(); }}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent"
        >
          <UserAvatar profile={profile} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium leading-none text-foreground">{firstName}</div>
            <div className="truncate text-xs text-muted-foreground">{profile?.email ?? 'Account'}</div>
          </div>
          <ChevronRight size={13} className="shrink-0 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 w-full rounded-md border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
