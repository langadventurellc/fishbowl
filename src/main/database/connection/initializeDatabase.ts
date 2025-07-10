/**
 * Initialize database connection
 */
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { databaseState } from './state';
import { enableWalMode } from '../checkpoint/enableWalMode';
import { configureAutoCheckpoint } from '../checkpoint/configureAutoCheckpoint';

export function initializeDatabase(): Database.Database {
  const existingDb = databaseState.getInstance();
  if (existingDb) {
    return existingDb;
  }

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'database.sqlite');

  const db = new Database(dbPath);

  // Set instance first so checkpoint utilities can access it
  databaseState.setInstance(db);

  // Enable WAL mode with optimized settings
  enableWalMode();

  // Configure auto-checkpoint threshold
  configureAutoCheckpoint(1000);

  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');

  return db;
}
