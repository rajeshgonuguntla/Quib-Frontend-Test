import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchBillingMe, type BillingStatus } from '../api/billingApi';
import { fetchEnrollmentStats } from '../api/catalogApi';
import type { EnrollmentStats } from '../types/catalog';

type ShellContextValue = {
  libraryStats: EnrollmentStats;
  refreshLibraryStats: () => void;
  billing: BillingStatus | null;
  refreshBilling: () => void;
};

const defaultStats: EnrollmentStats = { total: 0, inProgress: 0, saved: 0, completed: 0, avgScore: 0 };

const ShellContext = createContext<ShellContextValue>({
  libraryStats: defaultStats,
  refreshLibraryStats: () => {},
  billing: null,
  refreshBilling: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [libraryStats, setLibraryStats] = useState<EnrollmentStats>(defaultStats);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const refreshLibraryStats = () => {
    fetchEnrollmentStats()
      .then(setLibraryStats)
      .catch(() => setLibraryStats(defaultStats));
  };

  const refreshBilling = () => {
    fetchBillingMe()
      .then(setBilling)
      .catch(() => setBilling(null));
  };

  useEffect(() => {
    refreshLibraryStats();
    refreshBilling();
  }, []);

  return (
    <ShellContext.Provider value={{ libraryStats, refreshLibraryStats, billing, refreshBilling }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}
