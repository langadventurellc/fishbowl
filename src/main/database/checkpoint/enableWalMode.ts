/**
 * Enable WAL mode and configure checkpoint settings
 */
import { databaseState } from '../connection/state';

export function enableWalMode(): void {
  const db = databaseState.getInstance();
  if (!db) {
    throw new Error('Database connection not initialized');
  }

  // Enable WAL mode
  db.pragma('journal_mode = WAL');

  // Configure WAL settings for optimal performance
  db.pragma('synchronous = NORMAL'); // Faster than FULL, still safe in WAL mode
  db.pragma('cache_size = -16000'); // 16MB cache
  db.pragma('temp_store = MEMORY'); // Store temporary tables in memory
  db.pragma('mmap_size = 268435456'); // 256MB memory-mapped I/O
}
