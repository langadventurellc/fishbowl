/**
 * Get database file path
 */
import { app } from 'electron';
import path from 'path';

export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'database.sqlite');
}
