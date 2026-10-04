import { useNavigate } from 'react-router';
import { SidebarNavItem } from '../components/SidebarNavItem';
import { NAV_GROUPS, isNavItemActive, type NavItem } from './navConfig';
import { filterNavGroups, isEducatorExperience, isAdminAccount } from '../utils/signInIntent';
import { useUserProfile } from '../context/UserProfileContext';
import { useShell } from './ShellContext';
import { billingPlanLabel, hidesUpgradeCta } from '../api/billingApi';

type AppSidebarProps = {
  pathname: string;
  search: string;
  onNavigate?: () => void;
  /** `drawer` = mobile sheet — keep Settings in normal flow (mt-auto was pushing it off-screen). */
  layout?: 'sidebar' | 'drawer';
};

const FOOTER_NAV_IDS = new Set(['settings']);

function NavList({
  items,
  pathname,
  search,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  search: string;
  onNavigate?: () => void;
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
          />
        );
      })}
    </div>
  );
}

function SidebarUpgradeChip({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { billing } = useShell();
  if (!profile || isAdminAccount(profile)) return null;
  if (billing && hidesUpgradeCta(billing)) return null;

  return (
    <div className="cuib-upgrade-chip mt-3">
      <span className="text-[12.5px] font-semibold text-[var(--ink-soft)]">
        {billingPlanLabel(billing, false)}
      </span>
      <button
        type="button"
        onClick={() => {
          navigate('/upgrade');
          onNavigate?.();
        }}
        className="rounded-full bg-[var(--accent)] px-4 py-[9px] text-[12.5px] font-bold text-white transition-opacity hover:opacity-[0.88] active:scale-95"
      >
        Upgrade
      </button>
    </div>
  );
}

export function AppSidebar({ pathname, search, onNavigate, layout = 'sidebar' }: AppSidebarProps) {
  const { profile } = useUserProfile();
  const isDrawer = layout === 'drawer';
  const navGroups = filterNavGroups(NAV_GROUPS, isEducatorExperience(profile), profile)
    .filter((group) => group.items.length > 0);

  const primaryItems: NavItem[] = [];
  const createItems: NavItem[] = [];
  const footerItems: NavItem[] = [];

  for (const group of navGroups) {
    if (group.label === 'Create') {
      createItems.push(...group.items);
      continue;
    }
    for (const item of group.items) {
      // Drawer: keep Settings with primary links so it isn't stuck below the fold.
      if (!isDrawer && FOOTER_NAV_IDS.has(item.id)) footerItems.push(item);
      else primaryItems.push(item);
    }
  }

  return (
    <nav
      className={isDrawer ? 'flex flex-col' : 'flex h-full min-h-0 flex-col'}
      aria-label="Main"
    >
      <div className="shrink-0">
        <NavList items={primaryItems} pathname={pathname} search={search} onNavigate={onNavigate} />
        {createItems.length > 0 ? (
          <div className="mt-5">
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
            <NavList items={createItems} pathname={pathname} search={search} onNavigate={onNavigate} />
          </div>
        ) : null}
      </div>

      <div
        className={isDrawer ? 'mt-4 shrink-0 pt-4' : 'mt-auto shrink-0 pt-4'}
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {footerItems.length > 0 ? (
          <NavList items={footerItems} pathname={pathname} search={search} onNavigate={onNavigate} />
        ) : null}
        <SidebarUpgradeChip onNavigate={onNavigate} />
      </div>
    </nav>
  );
}
