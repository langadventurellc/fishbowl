/**
 * Checkpoint manager options
 */
import { CheckpointMode } from './CheckpointMode';

export interface CheckpointOptions {
  maxWalSize: number; // Maximum WAL file size in bytes before forcing checkpoint
  intervalMs: number; // Checkpoint interval in milliseconds
  mode: CheckpointMode; // Default checkpoint mode
}
