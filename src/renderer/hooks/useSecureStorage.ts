/**
 * React hook for secure storage operations
 */

import { useCallback, useState } from 'react';
import type { AiProvider, CredentialInfo } from '../../shared/types';

// Type guard to check if electronAPI is available
const isElectronAPIAvailable = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI !== undefined;
};

// Hook for credential operations
export const useSecureStorage = () => {
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCredential = useCallback(async (provider: AiProvider) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      return await window.electronAPI.secureCredentialsGet(provider);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get credential';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setCredential = useCallback(
    async (provider: AiProvider, apiKey: string, metadata?: Record<string, unknown>) => {
      if (!isElectronAPIAvailable()) {
        setError('Electron API not available');
        return false;
      }

      try {
        setLoading(true);
        setError(null);
        await window.electronAPI.secureCredentialsSet(provider, apiKey, metadata);

        // Update the credentials list
        setCredentials(prev => {
          const existingIndex = prev.findIndex(c => c.provider === provider);
          const newCredential: CredentialInfo = {
            provider,
            hasApiKey: true,
            lastUpdated: Date.now(),
            metadata,
          };

          if (existingIndex >= 0) {
            const newCredentials = [...prev];
            newCredentials[existingIndex] = newCredential;
            return newCredentials;
          } else {
            return [...prev, newCredential];
          }
        });

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set credential';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteCredential = useCallback(async (provider: AiProvider) => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await window.electronAPI.secureCredentialsDelete(provider);

      // Update the credentials list
      setCredentials(prev => prev.filter(c => c.provider !== provider));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete credential';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const listCredentials = useCallback(async () => {
    if (!isElectronAPIAvailable()) {
      setError('Electron API not available');
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.electronAPI.secureCredentialsList();
      setCredentials(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list credentials';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    credentials,
    loading,
    error,
    getCredential,
    setCredential,
    deleteCredential,
    listCredentials,
  };
};
