/**
 * Checkpoint configuration interface
 */
export interface CheckpointConfig {
  /**
   * Enable or disable automatic checkpoint management
   */
  enabled: boolean;

  /**
   * Maximum WAL file size in bytes before forcing a checkpoint
   * Default: 64MB
   */
  maxWalSize: number;

  /**
   * Interval in milliseconds for checking WAL file size
   * Default: 30 seconds
   */
  checkInterval: number;

  /**
   * Default checkpoint mode to use
   * - PASSIVE: Don't block readers, may not complete if database is busy
   * - FULL: Wait for readers to finish, then checkpoint
   * - RESTART: Restart WAL file from beginning
   * - TRUNCATE: Truncate WAL file to zero bytes
   * Default: PASSIVE
   */
  defaultMode: 'PASSIVE' | 'FULL' | 'RESTART' | 'TRUNCATE';

  /**
   * Auto-checkpoint threshold (number of WAL pages)
   * Set to 0 to disable auto-checkpointing
   * Default: 1000 pages
   */
  autoCheckpointThreshold: number;
}
