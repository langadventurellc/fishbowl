/**
 * Default checkpoint configuration
 */
import { CheckpointConfig } from './CheckpointConfig';

export const DEFAULT_CHECKPOINT_CONFIG: CheckpointConfig = {
  enabled: true,
  maxWalSize: 64 * 1024 * 1024, // 64MB
  checkInterval: 30 * 1000, // 30 seconds
  defaultMode: 'PASSIVE',
  autoCheckpointThreshold: 1000, // 1000 pages
};
