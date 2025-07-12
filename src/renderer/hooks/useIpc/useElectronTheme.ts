/**
 * React hook for theme management
 */
import { useCallback, useEffect, useState } from 'react';
import { isElectronAPIAvailable } from './isElectronAPIAvailable';

export const useElectronTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const currentTheme = await window.electronAPI.getTheme();
      setTheme(currentTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch theme');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTheme = useCallback(async (newTheme: 'light' | 'dark' | 'system') => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return;
    }

    try {
      setError(null);
      await window.electronAPI.setTheme(newTheme);
      setTheme(newTheme);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update theme');
    }
  }, []);

  useEffect(() => {
    void fetchTheme();
  }, [fetchTheme]);

  // Listen for theme changes from main process
  useEffect(() => {
    if (!isElectronAPIAvailable()) return;

    return window.electronAPI.onThemeChange((newTheme: 'light' | 'dark' | 'system') => {
      setTheme(newTheme);
    });
  }, []);

  return { theme, loading, error, updateTheme, refetch: fetchTheme };
};
