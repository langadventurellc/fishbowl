/**
 * Get current database version
 */
import { getDatabase } from '../connection';

export function getCurrentVersion(): number {
  const db = getDatabase();
  return db.pragma('user_version', { simple: true }) as number;
}
