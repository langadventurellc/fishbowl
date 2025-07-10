/**
 * React hook for direct keytar operations
 */

import { useCallback, useState } from 'react';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for direct keytar operations
export const useKeytar = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPassword = useCallback(async (service: string, account: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return await window.electronAPI.secureKeytarGet(service, account);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get password';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPassword = useCallback(async (service: string, account: string, password: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.secureKeytarSet(service, account, password);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set password';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePassword = useCallback(async (service: string, account: string) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.secureKeytarDelete(service, account);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete password';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPassword,
    setPassword,
    deletePassword,
  };
};
