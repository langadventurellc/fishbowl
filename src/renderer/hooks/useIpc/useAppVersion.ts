/**
 * React hook for application version
 */
import { useCallback, useEffect, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useAppVersion = () => {
  const [version, setVersion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersion = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const appVersion = await window.electronAPI.getVersion();
      setVersion(appVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch version');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVersion();
  }, [fetchVersion]);

  return { version, loading, error, refetch: fetchVersion };
};
