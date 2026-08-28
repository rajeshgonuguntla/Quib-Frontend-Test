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
  const { libraryStats } = useShell();

  const go = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <div>
      {label ? (
        <p
          className="mb-2 px-2.5 uppercase"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            color: 'var(--ink-faint)',
          }}
        >
          {label}
        </p>
      ) : null}
      <div className="flex flex-col gap-1.5">
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
    </div>
  );
}

export function AppSidebar({ pathname, search, onNavigate }: AppSidebarProps) {
  const { profile } = useUserProfile();
  const navGroups = filterNavGroups(NAV_GROUPS, isEducatorExperience(profile), profile)
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-7">
      {navGroups.map((group) => (
        <NavGroupBlock
          key={group.label || group.items[0]?.id || 'menu'}
          label={group.label}
          items={group.items}
          pathname={pathname}
          search={search}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
