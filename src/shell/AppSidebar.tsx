import { useNavigate } from 'react-router';
import { SidebarNavItem } from '../components/SidebarNavItem';
import { NAV_GROUPS, isNavItemActive, type NavItem } from './navConfig';
import { filterNavGroups, isEducatorExperience } from '../utils/signInIntent';
import { useUserProfile } from '../context/UserProfileContext';
import { useShell } from './ShellContext';

type AppSidebarProps = {
  pathname: string;
  search: string;
  onNavigate?: () => void;
};

const FOOTER_NAV_IDS = new Set(['settings', 'help']);

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

export function AppSidebar({ pathname, search, onNavigate }: AppSidebarProps) {
  const { profile } = useUserProfile();
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
      if (FOOTER_NAV_IDS.has(item.id)) footerItems.push(item);
      else primaryItems.push(item);
    }
  }

  return (
    <nav className="flex h-full min-h-0 flex-col" aria-label="Main">
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

      {footerItems.length > 0 ? (
        <div
          className="mt-auto shrink-0 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <NavList items={footerItems} pathname={pathname} search={search} onNavigate={onNavigate} />
        </div>
      ) : null}
    </nav>
  );
}
