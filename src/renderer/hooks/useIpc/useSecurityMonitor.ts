/**
 * React hook for security monitoring
 */
import { useCallback, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useSecurityMonitor = () => {
  const [securityStats, setSecurityStats] = useState<unknown>(null);
  const [auditLog, setAuditLog] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSecurityStats = useCallback(() => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = window.electronAPI.getSecurityStats();
      setSecurityStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get security stats';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSecurityAuditLog = useCallback(() => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const log = window.electronAPI.getSecurityAuditLog();
      setAuditLog(log);
      return log;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get security audit log';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSecurityAuditLog = useCallback(() => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setError(null);
      window.electronAPI.clearSecurityAuditLog();
      setAuditLog(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear security audit log';
      setError(errorMessage);
      return false;
    }
  }, []);

  return {
    securityStats,
    auditLog,
    loading,
    error,
    getSecurityStats,
    getSecurityAuditLog,
    clearSecurityAuditLog,
  };
};
