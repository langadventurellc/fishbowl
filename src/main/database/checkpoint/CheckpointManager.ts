/**
 * WAL checkpoint management system
 */
import { promises as fs } from 'fs';
import path from 'path';
import { app } from 'electron';
import { databaseState } from '../connection/state';
import { CheckpointMode } from './CheckpointMode';
import { CheckpointResult } from './CheckpointResult';
import { CheckpointOptions } from './CheckpointOptions';

export class CheckpointManager {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly options: CheckpointOptions;
  private readonly walPath: string;

  constructor(options: CheckpointOptions) {
    this.options = options;
    const userDataPath = app.getPath('userData');
    this.walPath = path.join(userDataPath, 'database.sqlite-wal');
  }

  /**
   * Start periodic checkpoint monitoring
   */
  start(): void {
    if (this.intervalId) {
      return; // Already started
    }

    this.intervalId = setInterval(() => {
      this.checkAndPerformCheckpoint().catch(error => {
        console.error('Checkpoint monitoring error:', error);
      });
    }, this.options.intervalMs);

    // Ensure interval doesn't keep process alive
    this.intervalId.unref();
  }

  /**
   * Stop periodic checkpoint monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check WAL file size and perform checkpoint if necessary
   */
  async checkAndPerformCheckpoint(): Promise<void> {
    try {
      const walSize = await this.getWalSize();
      if (walSize > this.options.maxWalSize) {
        await this.performCheckpoint(this.options.mode);
      }
    } catch (error) {
      // WAL file might not exist yet, which is normal
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Get current WAL file size
   */
  async getWalSize(): Promise<number> {
    try {
      const stats = await fs.stat(this.walPath);
      return stats.size;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return 0; // WAL file doesn't exist
      }
      throw error;
    }
  }

  /**
   * Perform checkpoint operation
   */
  performCheckpoint(mode: CheckpointMode = 'PASSIVE'): Promise<CheckpointResult> {
    const db = databaseState.getInstance();
    if (!db) {
      throw new Error('Database connection not initialized');
    }

    try {
      const result = db.pragma(`wal_checkpoint(${mode})`);

      // Result format: [busy, log_pages, checkpointed_pages]
      const [busy, logPages, checkpointedPages] = Array.isArray(result) ? result : [0, 0, 0];

      return Promise.resolve({
        totalPages: logPages ?? 0,
        modifiedPages: checkpointedPages ?? 0,
        success: busy === 0,
      });
    } catch (error) {
      console.error(`Checkpoint failed with mode ${mode}:`, error);
      throw error;
    }
  }

  /**
   * Force checkpoint with RESTART mode (most aggressive)
   */
  async forceCheckpoint(): Promise<CheckpointResult> {
    return await this.performCheckpoint('RESTART');
  }

  /**
   * Get checkpoint statistics
   */
  async getCheckpointStats(): Promise<{
    walSize: number;
    walPages: number;
    mode: string;
  }> {
    const db = databaseState.getInstance();
    if (!db) {
      throw new Error('Database connection not initialized');
    }

    const walSize = await this.getWalSize();
    const walPages = db.pragma('wal_autocheckpoint', { simple: true }) as number;
    const mode = db.pragma('journal_mode', { simple: true }) as string;

    return {
      walSize,
      walPages,
      mode,
    };
  }
}
