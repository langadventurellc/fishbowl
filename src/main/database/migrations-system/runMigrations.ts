/**
 * Run database migrations
 */
import { getDatabase } from '../connection';
import { getCurrentVersion } from './getCurrentVersion';
import { setVersion } from './setVersion';
import { loadMigrations } from './loadMigrations';

export function runMigrations(): void {
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

  db.transaction(() => {
    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.filename}`);
      db.exec(migration.sql);
      setVersion(migration.version);
    }
  })();

  console.log('Migrations completed');
}
