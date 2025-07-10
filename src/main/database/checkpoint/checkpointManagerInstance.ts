/**
 * Global checkpoint manager instance
 */
import { CheckpointManager } from './CheckpointManager';

// Default checkpoint configuration
const DEFAULT_CHECKPOINT_OPTIONS = {
  maxWalSize: 64 * 1024 * 1024, // 64MB - prevent WAL file from growing too large
  intervalMs: 30 * 1000, // 30 seconds - check WAL size every 30 seconds
  mode: 'PASSIVE' as const, // Default to passive mode to avoid blocking
};

export const checkpointManagerInstance = new CheckpointManager(DEFAULT_CHECKPOINT_OPTIONS);
