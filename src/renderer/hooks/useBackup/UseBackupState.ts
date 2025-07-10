/**
 * useBackup hook state interface
 */
import type { BackupMetadata, BackupStats } from '../../../shared/types';

export interface UseBackupState {
  backups: BackupMetadata[];
  stats: BackupStats | null;
  loading: boolean;
  error: string | null;
  lastOperation: string | null;
}
