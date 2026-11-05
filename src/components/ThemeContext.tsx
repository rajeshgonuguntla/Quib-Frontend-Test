import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const THEME_STORAGE_KEY = 'quib_theme';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  setDark: () => {},
});

function readStoredTheme(): boolean {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light') return false;
    if (stored === 'dark') return true;
  } catch {
    // ignore
  }
  return true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  const setDark = (dark: boolean) => setIsDark(dark);
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function getC(isDark: boolean) {
  // Cubit orange theme — `red*` keys are the brand accent (legacy name).
  // Correct / incorrect feedback should use green / #ef4444, not these.
  return isDark
    ? {
        bg: '#050505',
        bg1: '#0d0d0d',
        bg2: '#141414',
        bg3: '#1a1a1a',
        border: '#1c1c1c',
        border2: 'rgba(255,255,255,0.14)',
        text: '#f2f2f2',
        text2: '#8a8a8a',
        text3: '#5a5a5a',
        red: '#ff7a1a',
        redDim: 'rgba(255,122,26,0.12)',
        redGlow: 'rgba(255,122,26,0.22)',
      }
    : {
        bg: '#ffffff',
        bg1: '#f7f7f8',
        bg2: '#efefef',
        bg3: '#e8e8ea',
        border: 'rgba(0,0,0,0.11)',
        border2: 'rgba(0,0,0,0.18)',
        text: '#0c0c0e',
        text2: '#525252',
        text3: '#737373',
        red: '#e8650a',
        redDim: 'rgba(232,101,10,0.09)',
        redGlow: 'rgba(232,101,10,0.18)',
      };
}
