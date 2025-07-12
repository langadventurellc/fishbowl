/**
 * React hook for configuration management
 */
import { useCallback, useEffect, useState } from 'react';
import type { ConfigKey, ConfigValue } from '../../../shared/types';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useConfig = <K extends ConfigKey>(key: K) => {
  const [value, setValue] = useState<ConfigValue[K] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const configValue = await window.electronAPI.getConfig(key);
      setValue(configValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setLoading(false);
    }
  }, [key]);

  const updateConfig = useCallback(
    async (newValue: ConfigValue[K]) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return;
      }

      try {
        setError(null);
        await window.electronAPI.setConfig(key, newValue);
        setValue(newValue);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update config');
      }
    },
    [key],
  );

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  return { value, loading, error, updateConfig, refetch: fetchConfig };
};
