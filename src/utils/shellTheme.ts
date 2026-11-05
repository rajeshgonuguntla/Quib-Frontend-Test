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

/** Cubit orange shell tokens — layouts unchanged. */
export function getShellTheme(isDark: boolean): ShellTheme {
  if (isDark) {
    return {
      bg: '#050505',
      sidebar: '#050505',
      surface: '#0d0d0d',
      border: '#1c1c1c',
      borderMd: 'rgba(255,255,255,0.14)',
      accent: '#ff7a1a',
      accentBg: 'rgba(255,122,26,0.12)',
      accentBd: 'rgba(255,122,26,0.28)',
      accentLt: '#ff9447',
      green: '#22C55E',
      greenBg: 'rgba(34,197,94,0.08)',
      amber: '#F59E0B',
      t1: '#f2f2f2',
      t2: '#8a8a8a',
      t3: '#737373',
      t4: '#5a5a5a',
      headerBg: 'rgba(5,5,5,0.88)',
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
    accent: '#e8650a',
    accentBg: 'rgba(232,101,10,0.08)',
    accentBd: 'rgba(232,101,10,0.22)',
    accentLt: '#c45508',
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
      bg: '#050505',
      panel: '#0d0d0d',
      panelHover: '#141414',
      border: '#1c1c1c',
      text: '#f2f2f2',
      muted: '#8a8a8a',
      accent: '#ff7a1a',
      accentSoft: 'rgba(255,122,26,0.12)',
      headerBg: 'rgba(5,5,5,0.88)',
    };
  }

  return {
    bg: '#fafafa',
    panel: '#ffffff',
    panelHover: '#f5f5f5',
    border: 'rgba(0,0,0,0.08)',
    text: '#0a0a0a',
    muted: '#737373',
    accent: '#e8650a',
    accentSoft: 'rgba(232,101,10,0.08)',
    headerBg: 'rgba(255,255,255,0.85)',
  };
}

export function neutralTag(theme: ShellTheme) {
  return { color: theme.t2, bg: theme.hover };
}
