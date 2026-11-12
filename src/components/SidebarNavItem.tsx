import type { ReactNode } from 'react';
import { cn } from './ui/utils';

export type SidebarNavItemData = {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string;
};

type SidebarNavItemProps = {
  item: SidebarNavItemData;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
};

export function SidebarNavItem({ item, active, onClick, collapsed = false }: SidebarNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        'relative flex w-full items-center rounded-md text-left text-[13px] transition-colors duration-150',
        collapsed
          ? 'min-h-11 justify-center px-0 py-2'
          : 'justify-between gap-2.5 py-[7px] pl-3.5 pr-1',
        active ? 'font-semibold text-[var(--ink)]' : 'font-medium text-[var(--ink-faint)] hover:bg-[var(--fill)] hover:text-[var(--ink-soft)]',
      )}
    >
      <span
        className="absolute left-0 top-1/2 w-[2px] -translate-y-1/2 rounded-full bg-[var(--accent)] transition-[height] duration-150"
        style={{ height: active ? 14 : 0 }}
      />
      <span className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
        <span className="flex size-[17px] shrink-0 items-center justify-center [&_svg]:size-[17px]">
          {item.icon}
        </span>
        {!collapsed ? item.label : null}
      </span>
      {!collapsed && item.badge ? (
        <span
          className="rounded-[5px] px-[7px] py-px"
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: active ? 'var(--accent)' : 'var(--ink-faint)',
            background: active ? 'var(--accent-soft)' : 'var(--fill)',
          }}
        >
          {item.badge}
        </span>
      ) : null}
    </button>
  );
}
