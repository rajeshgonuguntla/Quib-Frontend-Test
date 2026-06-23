export type ShellTheme = {
  bg: string;
  sidebar: string;
  surface: string;
  border: string;
  borderMd: string;
  accent: string;
  accentBg: string;
  accentBd: string;
  accentLt: string;
  green: string;
  greenBg: string;
  amber: string;
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  headerBg: string;
  hover: string;
  hoverStrong: string;
};

/** Neutral Vercel/shadcn shell — brand red used sparingly for accents. */
export function getShellTheme(isDark: boolean): ShellTheme {
  if (isDark) {
    return {
      bg: '#000000',
      sidebar: '#0a0a0a',
      surface: '#0a0a0a',
      border: 'rgba(255,255,255,0.08)',
      borderMd: 'rgba(255,255,255,0.12)',
      accent: '#E10600',
      accentBg: 'rgba(225,6,0,0.1)',
      accentBd: 'rgba(225,6,0,0.22)',
      accentLt: '#ff4d4d',
      green: '#22C55E',
      greenBg: 'rgba(34,197,94,0.08)',
      amber: '#F59E0B',
      t1: '#ededed',
      t2: '#a1a1a1',
      t3: '#737373',
      t4: '#525252',
      headerBg: 'rgba(0,0,0,0.85)',
      hover: 'rgba(255,255,255,0.05)',
      hoverStrong: 'rgba(255,255,255,0.08)',
    };
  }

  return {
    bg: '#fafafa',
    sidebar: '#ffffff',
    surface: '#ffffff',
    border: 'rgba(0,0,0,0.08)',
    borderMd: 'rgba(0,0,0,0.12)',
    accent: '#E10600',
    accentBg: 'rgba(225,6,0,0.06)',
    accentBd: 'rgba(225,6,0,0.18)',
    accentLt: '#c00500',
    green: '#16a34a',
    greenBg: 'rgba(22,163,74,0.08)',
    amber: '#d97706',
    t1: '#0a0a0a',
    t2: '#525252',
    t3: '#737373',
    t4: '#a3a3a3',
    headerBg: 'rgba(255,255,255,0.85)',
    hover: 'rgba(0,0,0,0.04)',
    hoverStrong: 'rgba(0,0,0,0.06)',
  };
}

export function getStudioTheme(isDark: boolean) {
  if (isDark) {
    return {
      bg: '#000000',
      panel: '#0a0a0a',
      panelHover: '#141414',
      border: 'rgba(255,255,255,0.08)',
      text: '#ededed',
      muted: '#737373',
      accent: '#E10600',
      accentSoft: 'rgba(225,6,0,0.1)',
      headerBg: 'rgba(0,0,0,0.85)',
    };
  }

  return {
    bg: '#fafafa',
    panel: '#ffffff',
    panelHover: '#f5f5f5',
    border: 'rgba(0,0,0,0.08)',
    text: '#0a0a0a',
    muted: '#737373',
    accent: '#E10600',
    accentSoft: 'rgba(225,6,0,0.06)',
    headerBg: 'rgba(255,255,255,0.85)',
  };
}

export function neutralTag(theme: ShellTheme) {
  return { color: theme.t2, bg: theme.hover };
}
