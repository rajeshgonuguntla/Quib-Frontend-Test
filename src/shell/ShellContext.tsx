import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchEnrollmentStats } from '../api/catalogApi';
import type { EnrollmentStats } from '../types/catalog';

type ShellContextValue = {
  libraryStats: EnrollmentStats;
  refreshLibraryStats: () => void;
};

const defaultStats: EnrollmentStats = { total: 0, inProgress: 0, saved: 0, completed: 0, avgScore: 0 };

const ShellContext = createContext<ShellContextValue>({
  libraryStats: defaultStats,
  refreshLibraryStats: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [libraryStats, setLibraryStats] = useState<EnrollmentStats>(defaultStats);

  const refreshLibraryStats = () => {
    fetchEnrollmentStats()
      .then(setLibraryStats)
      .catch(() => setLibraryStats(defaultStats));
  };

  useEffect(() => {
    refreshLibraryStats();
  }, []);

  return (
    <ShellContext.Provider value={{ libraryStats, refreshLibraryStats }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}
