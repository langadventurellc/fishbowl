/**
 * React hook for database backup operations
 */
import { useCallback, useEffect, useState } from 'react';
import type {
  BackupOptions,
  BackupResult,
  RestoreOptions,
  RestoreResult,
} from '../../../shared/types';
import { parseError } from '../../utils/database/parseError';
import type { UseBackupState } from './UseBackupState';
import type { UseBackupReturn } from './UseBackupReturn';

export function useBackup(): UseBackupReturn {
  const [state, setState] = useState<UseBackupState>({
    backups: [],
    stats: null,
    loading: false,
    error: null,
    lastOperation: null,
  });

  const updateState = useCallback((updates: Partial<UseBackupState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const setLoading = useCallback(
    (loading: boolean) => {
      updateState({ loading });
    },
    [updateState],
  );

  const setError = useCallback(
    (error: string | null) => {
      updateState({ error });
    },
    [updateState],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const refreshBackups = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const backups = await window.electronAPI.dbBackupList();
      updateState({ backups });
    } catch (error) {
      const errorMessage = parseError(error, 'refresh backups').message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, updateState]);

  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const stats = await window.electronAPI.dbBackupStats();
      updateState({ stats });
    } catch (error) {
      const errorMessage = parseError(error, 'refresh stats').message;
      setError(errorMessage);
    }
  }, [setError, updateState]);

  const createBackup = useCallback(
    async (options?: BackupOptions): Promise<BackupResult> => {
      try {
        setLoading(true);
        setError(null);
        updateState({ lastOperation: 'create' });

        const result = await window.electronAPI.dbBackupCreate(options);

        if (result.success) {
          // Refresh backups and stats after successful creation
          await Promise.all([refreshBackups(), refreshStats()]);
        }

        return result;
      } catch (error) {
        const errorMessage = parseError(error, 'create backup').message;
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        updateState({ lastOperation: null });
      }
    },
    [setLoading, setError, updateState, refreshBackups, refreshStats],
  );

  const restoreBackup = useCallback(
    async (backupPath: string, options?: RestoreOptions): Promise<RestoreResult> => {
      try {
        setLoading(true);
        setError(null);
        updateState({ lastOperation: 'restore' });

        const result = await window.electronAPI.dbBackupRestore(backupPath, options);

        if (result.success) {
          // Refresh backups after successful restore
          await refreshBackups();
        }

        return result;
      } catch (error) {
        const errorMessage = parseError(error, 'restore backup').message;
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        updateState({ lastOperation: null });
      }
    },
    [setLoading, setError, updateState, refreshBackups],
  );

  const deleteBackup = useCallback(
    async (backupId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        updateState({ lastOperation: 'delete' });

        const success = await window.electronAPI.dbBackupDelete(backupId);

        if (success) {
          // Refresh backups and stats after successful deletion
          await Promise.all([refreshBackups(), refreshStats()]);
        }

        return success;
      } catch (error) {
        const errorMessage = parseError(error, 'delete backup').message;
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        updateState({ lastOperation: null });
      }
    },
    [setLoading, setError, updateState, refreshBackups, refreshStats],
  );

  const validateBackup = useCallback(
    async (backupPath: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        updateState({ lastOperation: 'validate' });

        return await window.electronAPI.dbBackupValidate(backupPath);
      } catch (error) {
        const errorMessage = parseError(error, 'validate backup').message;
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
        updateState({ lastOperation: null });
      }
    },
    [setLoading, setError, updateState],
  );

  const cleanupBackups = useCallback(async (): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      updateState({ lastOperation: 'cleanup' });

      const deletedFiles = await window.electronAPI.dbBackupCleanup();

      // Refresh backups and stats after cleanup
      await Promise.all([refreshBackups(), refreshStats()]);

      return deletedFiles;
    } catch (error) {
      const errorMessage = parseError(error, 'cleanup backups').message;
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      updateState({ lastOperation: null });
    }
  }, [setLoading, setError, updateState, refreshBackups, refreshStats]);

  // Load initial data
  useEffect(() => {
    Promise.all([refreshBackups(), refreshStats()]).catch(error => {
      console.error('Failed to load initial backup data:', error);
    });
  }, [refreshBackups, refreshStats]);

  return {
    // State
    backups: state.backups,
    stats: state.stats,
    loading: state.loading,
    error: state.error,
    lastOperation: state.lastOperation,

    // Actions
    createBackup,
    restoreBackup,
    deleteBackup,
    validateBackup,
    cleanupBackups,
    refreshBackups,
    refreshStats,
    clearError,
  };
}
