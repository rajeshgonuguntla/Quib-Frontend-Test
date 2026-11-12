import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchBillingMe, type BillingStatus } from '../api/billingApi';
import { fetchEnrollmentStats } from '../api/catalogApi';
import type { EnrollmentStats } from '../types/catalog';
import { readSidebarCollapsed, writeSidebarCollapsed } from '../utils/sidebarCollapsed';

type ShellContextValue = {
  libraryStats: EnrollmentStats;
  refreshLibraryStats: () => void;
  billing: BillingStatus | null;
  refreshBilling: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

const defaultStats: EnrollmentStats = { total: 0, inProgress: 0, saved: 0, completed: 0, avgScore: 0 };

const ShellContext = createContext<ShellContextValue>({
  libraryStats: defaultStats,
  refreshLibraryStats: () => {},
  billing: null,
  refreshBilling: () => {},
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
});

export function ShellProvider({ children }: { children: ReactNode }) {
  const [libraryStats, setLibraryStats] = useState<EnrollmentStats>(defaultStats);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => readSidebarCollapsed());

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

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    writeSidebarCollapsed(collapsed);
  };

  useEffect(() => {
    refreshLibraryStats();
    refreshBilling();
  }, []);

  return (
    <ShellContext.Provider
      value={{
        libraryStats,
        refreshLibraryStats,
        billing,
        refreshBilling,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}
