/**
 * Close database connection
 */
import { databaseState } from './state';

export function closeDatabase(): void {
  const db = databaseState.getInstance();
  if (db) {
    db.close();
    databaseState.setInstance(null);
  }
}
