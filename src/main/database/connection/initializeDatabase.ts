/**
 * Initialize database connection
 */
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { databaseState } from './state';

export function initializeDatabase(): Database.Database {
  const existingDb = databaseState.getInstance();
  if (existingDb) {
    return existingDb;
  }

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'database.sqlite');

  const db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');

  databaseState.setInstance(db);
  return db;
}
