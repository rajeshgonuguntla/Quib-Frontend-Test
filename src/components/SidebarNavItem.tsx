import { useState, type ReactNode } from 'react';

const T = {
  accentBg: 'rgba(99,102,241,0.1)',
  accentBd: 'rgba(99,102,241,0.22)',
  accentLt: '#818CF8',
  t3: '#71717A',
  t4: '#3F3F46',
  border: 'rgba(255,255,255,0.07)',
};

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
};

export function SidebarNavItem({ item, active, onClick }: SidebarNavItemProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const showHover = hovered && !active;
  const showPress = pressed;

  const background = active
    ? T.accentBg
    : showPress
      ? 'rgba(255,255,255,0.09)'
      : showHover
        ? 'rgba(255,255,255,0.06)'
        : 'transparent';

  const border = active
    ? `1px solid ${T.accentBd}`
    : showHover || showPress
      ? '1px solid rgba(255,255,255,0.08)'
      : '1px solid transparent';

  const textColor = active ? T.accentLt : showHover || showPress ? '#E4E4E7' : T.t3;
  const iconColor = active ? T.accentLt : showHover || showPress ? '#D4D4D8' : T.t4;

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
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-all duration-150 ease-out"
      style={{
        background,
        border,
        color: textColor,
        fontWeight: active ? 500 : 400,
        transform: showPress ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      <span className="transition-colors duration-150" style={{ color: iconColor }}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span
          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-colors duration-150"
          style={{
            background: active ? T.accentBg : showHover ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
            color: active ? T.accentLt : showHover ? '#D4D4D8' : T.t4,
            border: `1px solid ${active ? T.accentBd : T.border}`,
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}
