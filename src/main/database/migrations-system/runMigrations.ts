/* eslint-disable no-console */
/**
 * Run database migrations
 */
import { getDatabase } from '../connection';
import { getCurrentVersion } from './getCurrentVersion';
import { loadMigrations } from './loadMigrations';
import { setVersion } from './setVersion';

export function runMigrations(): void {
  try {
    const db = getDatabase();
    const currentVersion = getCurrentVersion();
    const migrations = loadMigrations();

    console.log(`Database version: ${currentVersion}`);

    const pendingMigrations = migrations.filter(m => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Running ${pendingMigrations.length} migration(s)`);

    // Validate migration sequence
    const sortedMigrations = pendingMigrations.sort((a, b) => a.version - b.version);
    for (let i = 0; i < sortedMigrations.length; i++) {
      const expected = currentVersion + i + 1;
      if (sortedMigrations[i].version !== expected) {
        throw new Error(
          `Migration sequence error: expected version ${expected}, got ${sortedMigrations[i].version}`,
        );
      }
    }

    // Run migrations in a transaction
    db.transaction(() => {
      for (const migration of sortedMigrations) {
        console.log(`Running migration ${migration.filename}`);

        try {
          db.exec(migration.sql);
          setVersion(migration.version);
          console.log(`Migration ${migration.filename} completed successfully`);
        } catch (error) {
          console.error(`Migration ${migration.filename} failed:`, error);
          throw error;
        }
      }
    })();

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
