import { useState, useEffect, useCallback } from 'react';
import type {
  UnifiedPerformanceReport,
  DatabasePerformanceMetrics,
  IpcPerformanceMetrics,
  SystemPerformanceMetrics,
  PerformanceMetric,
  PerformanceHistoryPoint,
  PerformanceAlert,
  PerformanceThresholds,
  PerformanceOptimizationRequest,
} from '@shared/types';

import type { UsePerformanceMonitorReturn } from './UsePerformanceMonitorReturn';

interface UsePerformanceMonitorState {
  unifiedReport: UnifiedPerformanceReport | null;
  databaseMetrics: DatabasePerformanceMetrics | null;
  ipcMetrics: IpcPerformanceMetrics | null;
  systemMetrics: SystemPerformanceMetrics | null;
  recentMetrics: PerformanceMetric[];
  history: PerformanceHistoryPoint[];
  alerts: PerformanceAlert[];
  thresholds: PerformanceThresholds | null;
  isMonitoring: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for monitoring application performance
 */
export function usePerformanceMonitor(): UsePerformanceMonitorReturn {
  const [state, setState] = useState<UsePerformanceMonitorState>({
    unifiedReport: null,
    databaseMetrics: null,
    ipcMetrics: null,
    systemMetrics: null,
    recentMetrics: [],
    history: [],
    alerts: [],
    thresholds: null,
    isMonitoring: true,
    isLoading: false,
    error: null,
  });

  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Refresh unified report
  const refreshUnifiedReport = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const report = await window.electronAPI.performanceGetUnifiedReport();
      setState(prev => ({ ...prev, unifiedReport: report }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Refresh database metrics
  const refreshDatabaseMetrics = useCallback(async () => {
    try {
      const metrics = await window.electronAPI.performanceGetDatabaseMetrics();
      setState(prev => ({ ...prev, databaseMetrics: metrics }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Refresh IPC metrics
  const refreshIpcMetrics = useCallback(async () => {
    try {
      const metrics = await window.electronAPI.performanceGetIpcMetrics();
      setState(prev => ({ ...prev, ipcMetrics: metrics }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Refresh system metrics
  const refreshSystemMetrics = useCallback(async () => {
    try {
      const metrics = await window.electronAPI.performanceGetSystemMetrics();
      setState(prev => ({ ...prev, systemMetrics: metrics }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Refresh recent metrics
  const refreshRecentMetrics = useCallback(async (count: number = 100) => {
    try {
      const metrics = await window.electronAPI.performanceGetRecentMetrics(count);
      setState(prev => ({ ...prev, recentMetrics: metrics }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Refresh history
  const refreshHistory = useCallback(async (duration: number = 3600000) => {
    try {
      const history = await window.electronAPI.performanceGetHistory(duration);
      setState(prev => ({ ...prev, history }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Refresh alerts
  const refreshAlerts = useCallback(async (unresolvedOnly: boolean = false) => {
    try {
      const alerts = await window.electronAPI.performanceGetAlerts(unresolvedOnly);
      setState(prev => ({ ...prev, alerts }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Resolve alert
  const resolveAlert = useCallback(
    async (alertId: string) => {
      try {
        await window.electronAPI.performanceResolveAlert(alertId);
        await refreshAlerts();
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
      }
    },
    [refreshAlerts],
  );

  // Optimize performance
  const optimize = useCallback(
    async (request?: PerformanceOptimizationRequest) => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const result = await window.electronAPI.performanceOptimize(request);

        // Refresh metrics after optimization
        await refreshUnifiedReport();

        return result;
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        throw error;
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    },
    [refreshUnifiedReport],
  );

  // Refresh thresholds
  const refreshThresholds = useCallback(async () => {
    try {
      const thresholds = await window.electronAPI.performanceGetThresholds();
      setState(prev => ({ ...prev, thresholds }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Set thresholds
  const setThresholds = useCallback(
    async (thresholds: Partial<PerformanceThresholds>) => {
      try {
        await window.electronAPI.performanceSetThresholds(thresholds);
        await refreshThresholds();
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
      }
    },
    [refreshThresholds],
  );

  // Enable monitoring
  const enableMonitoring = useCallback(async (category?: 'database' | 'ipc' | 'system' | 'all') => {
    try {
      await window.electronAPI.performanceEnableMonitoring(category);
      setState(prev => ({ ...prev, isMonitoring: true }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error }));
    }
  }, []);

  // Disable monitoring
  const disableMonitoring = useCallback(
    async (category?: 'database' | 'ipc' | 'system' | 'all') => {
      try {
        await window.electronAPI.performanceDisableMonitoring(category);
        if (category === 'all') {
          setState(prev => ({ ...prev, isMonitoring: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
      }
    },
    [],
  );

  // Reset metrics
  const resetMetrics = useCallback(
    async (category?: 'database' | 'ipc' | 'system' | 'all') => {
      try {
        await window.electronAPI.performanceResetMetrics(category);
        // Refresh all metrics after reset
        await Promise.all([refreshUnifiedReport(), refreshRecentMetrics(), refreshHistory()]);
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
      }
    },
    [refreshUnifiedReport, refreshRecentMetrics, refreshHistory],
  );

  // Start auto refresh
  const startAutoRefresh = useCallback(
    (interval: number = 5000) => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }

      const refreshAll = async () => {
        await Promise.all([
          refreshUnifiedReport(),
          refreshAlerts(true), // Only unresolved alerts
        ]);
      };

      // Initial refresh
      void refreshAll();

      // Set up interval
      const intervalId = setInterval(() => {
        void refreshAll();
      }, interval);
      setAutoRefreshInterval(intervalId);
    },
    [autoRefreshInterval, refreshUnifiedReport, refreshAlerts],
  );

  // Stop auto refresh
  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  }, [autoRefreshInterval]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([refreshUnifiedReport(), refreshThresholds(), refreshAlerts(true)]);
    };

    void loadInitialData();
  }, [refreshUnifiedReport, refreshThresholds, refreshAlerts]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return {
    // State
    ...state,

    // Actions
    refreshUnifiedReport,
    refreshDatabaseMetrics,
    refreshIpcMetrics,
    refreshSystemMetrics,
    refreshRecentMetrics,
    refreshHistory,
    refreshAlerts,
    resolveAlert,
    optimize,
    setThresholds,
    refreshThresholds,
    enableMonitoring,
    disableMonitoring,
    resetMetrics,
    startAutoRefresh,
    stopAutoRefresh,
  };
}
