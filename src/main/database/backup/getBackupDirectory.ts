/**
 * Get backup directory path
 */
import { app } from 'electron';
import path from 'path';

export function getBackupDirectory(customDirectory?: string): string {
  if (customDirectory) {
    return customDirectory;
  }
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'backups');
}
