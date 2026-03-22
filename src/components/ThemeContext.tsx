import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function getC(isDark: boolean) {
  return isDark
    ? {
        bg: '#060608',
        bg1: '#0b0b0e',
        bg2: '#111115',
        bg3: '#18181d',
        border: 'rgba(255,255,255,0.07)',
        border2: 'rgba(255,255,255,0.12)',
        text: '#f2f2f0',
        text2: '#8a8a8a',
        text3: '#4a4a4a',
        red: '#E10600',
        redDim: 'rgba(225,6,0,0.10)',
        redGlow: 'rgba(225,6,0,0.20)',
      }
    : {
        bg: '#ffffff',
        bg1: '#f7f7f8',
        bg2: '#efefef',
        bg3: '#e8e8ea',
        border: 'rgba(0,0,0,0.08)',
        border2: 'rgba(0,0,0,0.14)',
        text: '#0c0c0e',
        text2: '#6b6b6b',
        text3: '#b0b0b0',
        red: '#E10600',
        redDim: 'rgba(225,6,0,0.07)',
        redGlow: 'rgba(225,6,0,0.18)',
      };
}
