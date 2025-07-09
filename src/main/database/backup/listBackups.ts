/**
 * List all available backups
 */
import { promises as fs } from 'fs';
import path from 'path';
import { BackupMetadata } from './BackupMetadata';

export async function listBackups(backupDirectory: string): Promise<BackupMetadata[]> {
  try {
    const files = await fs.readdir(backupDirectory);
    const backupFiles = files.filter(file => file.endsWith('.sqlite'));

    const backups: BackupMetadata[] = [];

    for (const file of backupFiles) {
      const filePath = path.join(backupDirectory, file);
      const stats = await fs.stat(filePath);

      // Extract timestamp from filename (format: database-backup-YYYY-MM-DDTHH-MM-SS-sssZ.sqlite)
      const match = file.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/);
      const timestamp = match
        ? new Date(match[1].replace(/-/g, ':')).getTime()
        : stats.mtime.getTime();

      backups.push({
        id: file,
        timestamp,
        filePath,
        size: stats.size,
        compressed: false, // TODO: Implement compression detection
        dbVersion: 0, // TODO: Extract from backup metadata
        appVersion: '', // TODO: Extract from backup metadata
        checksum: '', // TODO: Calculate or load from metadata
        walIncluded: await fs
          .access(`${filePath}-wal`)
          .then(() => true)
          .catch(() => false),
        shmIncluded: await fs
          .access(`${filePath}-shm`)
          .then(() => true)
          .catch(() => false),
      });
    }

    // Sort by timestamp (newest first)
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}
