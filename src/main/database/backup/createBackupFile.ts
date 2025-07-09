/**
 * Create backup file by copying database
 */
import { promises as fs } from 'fs';
import { getDatabasePath } from './getDatabasePath';

export async function createBackupFile(
  backupPath: string,
  includeWal: boolean = true,
  includeShm: boolean = false,
): Promise<void> {
  const dbPath = getDatabasePath();
  const walPath = `${dbPath}-wal`;
  const shmPath = `${dbPath}-shm`;

  // Copy main database file
  await fs.copyFile(dbPath, backupPath);

  // Copy WAL file if requested and exists
  if (includeWal) {
    try {
      await fs.access(walPath);
      await fs.copyFile(walPath, `${backupPath}-wal`);
    } catch (error) {
      // WAL file might not exist, which is normal
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  // Copy SHM file if requested and exists
  if (includeShm) {
    try {
      await fs.access(shmPath);
      await fs.copyFile(shmPath, `${backupPath}-shm`);
    } catch (error) {
      // SHM file might not exist, which is normal
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
