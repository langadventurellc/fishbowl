/**
 * Clean up old backups based on retention policy
 */
import { promises as fs } from 'fs';
import { listBackups } from './listBackups';

export async function cleanupOldBackups(
  backupDirectory: string,
  maxBackups: number = 10,
): Promise<string[]> {
  const backups = await listBackups(backupDirectory);
  const backupsToDelete = backups.slice(maxBackups);
  const deletedFiles: string[] = [];

  for (const backup of backupsToDelete) {
    try {
      await fs.unlink(backup.filePath);
      deletedFiles.push(backup.filePath);

      // Also delete associated WAL and SHM files
      if (backup.walIncluded) {
        try {
          await fs.unlink(`${backup.filePath}-wal`);
        } catch {
          // Ignore if file doesn't exist
        }
      }

      if (backup.shmIncluded) {
        try {
          await fs.unlink(`${backup.filePath}-shm`);
        } catch {
          // Ignore if file doesn't exist
        }
      }
    } catch (error) {
      console.warn(`Failed to delete backup ${backup.filePath}:`, error);
    }
  }

  return deletedFiles;
}
