import { useNavigate } from 'react-router';
import { LogOut, Settings } from 'lucide-react';
import { SidebarNavItem } from '../components/SidebarNavItem';
import { UserAvatar } from '../components/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { EDUCATOR_NAV_GROUPS, NAV_GROUPS, isNavItemActive, type NavItem } from './navConfig';
import { clearSignInIntent, filterNavGroups, isEducatorExperience, isEducatorAccount } from '../utils/signInIntent';
import { useUserProfile } from '../context/UserProfileContext';
import { useShell } from './ShellContext';
import { billingPlanLabel, hidesUpgradeCta } from '../api/billingApi';
import { clearToken } from '../auth';
import { SIGN_IN_PATH } from '../utils/navigation';
import { accountRoleLabel, getDisplayName } from '../utils/userDisplay';

type AppSidebarProps = {
  pathname: string;
  search: string;
  onNavigate?: () => void;
  /** `drawer` = mobile sheet. Settings stays inside the account name, not the link list. */
  layout?: 'sidebar' | 'drawer';
};

function NavList({
  items,
  pathname,
  search,
  onNavigate,
  collapsed,
}: {
  items: NavItem[];
  pathname: string;
  search: string;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const navigate = useNavigate();
  const { libraryStats } = useShell();

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div className="flex flex-col gap-px">
      {items.map((item) => {
        const badgeCount = item.badgeKey === 'total'
          ? (libraryStats.total || libraryStats.inProgress + libraryStats.saved + libraryStats.completed)
          : item.badgeKey
            ? libraryStats[item.badgeKey]
            : undefined;
        const badge = badgeCount != null ? String(badgeCount) : undefined;
        return (
          <SidebarNavItem
            key={item.id}
            item={{ ...item, badge }}
            active={isNavItemActive(pathname, search, item.id, item.path)}
            onClick={() => go(item.path)}
            collapsed={collapsed}
          />
        );
      })}
    </div>
  );
}

function SidebarAccount({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, setProfile } = useUserProfile();
  const { billing } = useShell();
  const displayName = getDisplayName(profile);
  const learner = Boolean(profile) && !isEducatorAccount(profile);
  const showUpgrade = learner && !(billing && hidesUpgradeCta(billing));
  const subtitle = learner ? billingPlanLabel(billing, false) : accountRoleLabel(profile);

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleSignOut = () => {
    clearToken();
    clearSignInIntent();
    setProfile(null);
    onNavigate?.();
    navigate(SIGN_IN_PATH);
  };

  return (
    <div className={collapsed ? 'flex justify-center' : 'flex items-center gap-2'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={
              collapsed
                ? 'flex size-11 items-center justify-center rounded-full outline-none'
                : 'flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl text-left outline-none'
            }
            aria-label="Account menu"
          >
            <UserAvatar profile={profile} size="md" variant="mono" />
            {collapsed ? null : (
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold leading-4 text-[var(--ink)]">
                  {displayName || (profileLoading ? 'Loading…' : 'Account')}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-faint)]">
                  {subtitle}
                </span>
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="start"
          className="z-[80] w-[220px] rounded-xl border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--ink)] shadow-[var(--shadow)]"
        >
          <DropdownMenuItem
            onClick={() => go('/settings')}
            className="min-h-11 cursor-pointer gap-3 rounded-lg px-3 text-[14px] font-medium text-[var(--ink)] focus:bg-[var(--fill)] focus:text-[var(--ink)]"
          >
            <Settings size={16} className="text-[var(--ink-soft)]" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSignOut}
            className="min-h-11 cursor-pointer gap-3 rounded-lg px-3 text-[14px] font-medium text-[var(--ink)] focus:bg-[var(--fill)] focus:text-[var(--ink)]"
          >
            <LogOut size={16} className="text-[var(--ink-soft)]" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {!collapsed && showUpgrade ? (
        <button
          type="button"
          onClick={() => go('/upgrade')}
          className="shrink-0 text-[14px] font-semibold text-[var(--accent)]"
        >
          Upgrade
        </button>
      ) : null}
    </div>
  );
}

export function AppSidebar({ pathname, search, onNavigate, layout = 'sidebar' }: AppSidebarProps) {
  const { profile } = useUserProfile();
  const { sidebarCollapsed } = useShell();
  const isDrawer = layout === 'drawer';
  const collapsed = !isDrawer && sidebarCollapsed;
  const studioV2Rail = isEducatorAccount(profile);
  const navGroups = (studioV2Rail
    ? EDUCATOR_NAV_GROUPS
    : filterNavGroups(NAV_GROUPS, isEducatorExperience(profile), profile)
  ).filter((group) => group.items.length > 0);

  const primaryItems: NavItem[] = [];
  const createItems: NavItem[] = [];

  for (const group of navGroups) {
    if (group.label === 'Create') {
      createItems.push(...group.items);
      continue;
    }
    for (const item of group.items) {
      if (item.id === 'settings') continue;
      primaryItems.push(item);
    }
  }

  return (
    <nav
      id={isDrawer ? undefined : 'cuib-sidebar-nav'}
      className={isDrawer ? 'flex flex-col' : 'flex h-full min-h-0 flex-col'}
      aria-label="Main"
    >
      <div className="shrink-0">
        <NavList
          items={primaryItems}
          pathname={pathname}
          search={search}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
        {createItems.length > 0 ? (
          <div className={collapsed ? 'mt-1' : 'mt-5'}>
            {collapsed ? null : (
              <p
                className="mb-1 px-2.5 uppercase"
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.06em',
                  color: 'var(--ink-faint)',
                }}
              >
                Create
              </p>
            )}
            <NavList
              items={createItems}
              pathname={pathname}
              search={search}
              onNavigate={onNavigate}
              collapsed={collapsed}
            />
          </div>
        ) : null}
      </div>

      <div
        className={isDrawer ? 'mt-4 shrink-0 pt-3' : 'mt-auto shrink-0 pt-3'}
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <SidebarAccount onNavigate={onNavigate} collapsed={collapsed} />
      </div>
    </nav>
  );
}
