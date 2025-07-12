/**
 * React hook for performance monitoring
 */
import { useCallback, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const usePerformanceMonitor = () => {
  const [performanceStats, setPerformanceStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPerformanceStats = useCallback(() => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = window.electronAPI.getPerformanceStats();
      setPerformanceStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get performance stats';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPerformanceStats = useCallback(() => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setError(null);
      window.electronAPI.clearPerformanceStats();
      setPerformanceStats(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear performance stats';
      setError(errorMessage);
      return false;
    }
  }, []);

  const getRecentMetrics = useCallback((limit?: number) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return window.electronAPI.getRecentMetrics(limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recent metrics';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    performanceStats,
    loading,
    error,
    getPerformanceStats,
    clearPerformanceStats,
    getRecentMetrics,
  };
};
