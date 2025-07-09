/**
 * Configure WAL auto-checkpoint threshold
 */
import { databaseState } from '../connection/state';

export function configureAutoCheckpoint(threshold: number): void {
  const db = databaseState.getInstance();
  if (!db) {
    throw new Error('Database connection not initialized');
  }

  db.pragma(`wal_autocheckpoint = ${threshold}`);
}
