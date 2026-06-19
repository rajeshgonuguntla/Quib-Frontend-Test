import { useState, type ReactNode } from 'react';
import type { ShellTheme } from '../utils/shellTheme';

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
  theme: ShellTheme;
};

export function SidebarNavItem({ item, active, onClick, theme }: SidebarNavItemProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const showHover = hovered && !active;
  const showPress = pressed;

  const background = active
    ? theme.accentBg
    : showPress
      ? theme.hoverStrong
      : showHover
        ? theme.hover
        : 'transparent';

  const border = active
    ? `1px solid ${theme.accentBd}`
    : showHover || showPress
      ? `1px solid ${theme.border}`
      : '1px solid transparent';

  const textColor = active ? theme.t1 : showHover || showPress ? theme.t1 : theme.t3;
  const iconColor = active ? theme.accent : showHover || showPress ? theme.t2 : theme.t4;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150"
      style={{
        background,
        border,
        color: textColor,
        fontWeight: active ? 500 : 400,
      }}
    >
      <span className="transition-colors duration-150" style={{ color: iconColor }}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span
          className="rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
          style={{
            background: active ? theme.hoverStrong : theme.hover,
            color: theme.t3,
            border: `1px solid ${theme.border}`,
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
