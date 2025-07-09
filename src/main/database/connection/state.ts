/**
 * Shared database connection state
 */
import Database from 'better-sqlite3';

let db: Database.Database | null = null;

export const databaseState = {
  getInstance(): Database.Database | null {
    return db;
  },

  setInstance(database: Database.Database | null): void {
    db = database;
  },
};
