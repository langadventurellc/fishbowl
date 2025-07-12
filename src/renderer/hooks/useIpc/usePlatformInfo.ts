/**
 * React hook for platform information
 */
import { useCallback, useEffect, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const usePlatformInfo = () => {
  const [platformInfo, setPlatformInfo] = useState({
    platform: '' as NodeJS.Platform,
    arch: '',
    version: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatformInfo = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [platform, arch, version] = await Promise.all([
        window.electronAPI.platform(),
        window.electronAPI.arch(),
        window.electronAPI.version(),
      ]);
      setPlatformInfo({ platform, arch, version });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch platform info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlatformInfo();
  }, [fetchPlatformInfo]);

  return { platformInfo, loading, error, refetch: fetchPlatformInfo };
};
