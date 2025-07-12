/**
 * React hook for development tools
 */
import { useCallback, useEffect, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useDevTools = () => {
  const [isDev, setIsDev] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevStatus = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const devStatus = await window.electronAPI.isDev();
      setIsDev(devStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dev status');
    } finally {
      setLoading(false);
    }
  }, []);

  const openDevTools = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return;
    }

    try {
      setError(null);
      await window.electronAPI.openDevTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open dev tools');
    }
  }, []);

  const closeDevTools = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return;
    }

    try {
      setError(null);
      await window.electronAPI.closeDevTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close dev tools');
    }
  }, []);

  useEffect(() => {
    void fetchDevStatus();
  }, [fetchDevStatus]);

  return { isDev, loading, error, openDevTools, closeDevTools, refetch: fetchDevStatus };
};
