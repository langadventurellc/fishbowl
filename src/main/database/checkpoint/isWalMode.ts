/**
 * Check if database is in WAL mode
 */
import { databaseState } from '../connection/state';

export function isWalMode(): boolean {
  const db = databaseState.getInstance();
  if (!db) {
    return false;
  }

  try {
    const journalMode = db.pragma('journal_mode', { simple: true }) as string;
    return journalMode.toUpperCase() === 'WAL';
  } catch (error) {
    console.error('Error checking WAL mode:', error);
    return false;
  }
}
