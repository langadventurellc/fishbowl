/**
 * Set database version
 */
import { getDatabase } from '../connection';

export function setVersion(version: number): void {
  const db = getDatabase();
  db.pragma(`user_version = ${version}`);
}
