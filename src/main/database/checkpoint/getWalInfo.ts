/**
 * Get WAL mode information
 */
import { databaseState } from '../connection/state';

export function getWalInfo(): {
  journalMode: string;
  walAutocheckpoint: number;
  synchronous: string;
  cacheSize: number;
} {
  const db = databaseState.getInstance();
  if (!db) {
    throw new Error('Database connection not initialized');
  }

  return {
    journalMode: db.pragma('journal_mode', { simple: true }) as string,
    walAutocheckpoint: db.pragma('wal_autocheckpoint', { simple: true }) as number,
    synchronous: db.pragma('synchronous', { simple: true }) as string,
    cacheSize: db.pragma('cache_size', { simple: true }) as number,
  };
}
