/**
 * Ensure backup directory exists
 */
import { promises as fs } from 'fs';

export async function ensureBackupDirectory(directory: string): Promise<void> {
  try {
    await fs.mkdir(directory, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}
