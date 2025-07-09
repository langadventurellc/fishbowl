/**
 * Get the current database connection
 */
import Database from 'better-sqlite3';
import { databaseState } from './state';

export function getDatabase(): Database.Database {
  const db = databaseState.getInstance();
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}
