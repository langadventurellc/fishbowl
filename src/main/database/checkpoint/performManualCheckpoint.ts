/**
 * Perform manual checkpoint with specified mode
 */
import { databaseState } from '../connection/state';
import { CheckpointMode } from './CheckpointMode';
import { CheckpointResult } from './CheckpointResult';

export function performManualCheckpoint(mode: CheckpointMode = 'PASSIVE'): CheckpointResult {
  const db = databaseState.getInstance();
  if (!db) {
    throw new Error('Database connection not initialized');
  }

  try {
    const result = db.pragma(`wal_checkpoint(${mode})`);

    // Result format: [busy, log_pages, checkpointed_pages]
    const [busy, logPages, checkpointedPages] = Array.isArray(result) ? result : [0, 0, 0];

    return {
      totalPages: logPages ?? 0,
      modifiedPages: checkpointedPages ?? 0,
      success: busy === 0,
    };
  } catch (error) {
    console.error(`Manual checkpoint failed with mode ${mode}:`, error);
    throw error;
  }
}
