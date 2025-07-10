/**
 * useBackup hook return type
 */
import type { UseBackupState } from './UseBackupState';
import type { UseBackupActions } from './UseBackupActions';

export interface UseBackupReturn extends UseBackupState, UseBackupActions {}
