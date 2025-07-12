/**
 * React hook for system information
 */
import { useCallback, useEffect, useState } from 'react';
import type { SystemInfo } from '../../../shared/types';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await window.electronAPI.getSystemInfo();
      setSystemInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSystemInfo();
  }, [fetchSystemInfo]);

  return { systemInfo, loading, error, refetch: fetchSystemInfo };
};
