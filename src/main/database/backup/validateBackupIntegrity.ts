/**
 * Validate backup integrity using SQLite PRAGMA integrity_check
 */
import Database from 'better-sqlite3';

export function validateBackupIntegrity(backupPath: string): boolean {
  let db: Database.Database | null = null;

  try {
    db = new Database(backupPath, { readonly: true });

    // Check database integrity
    const integrityResult = db.pragma('integrity_check');
    const isIntegrityOk = Array.isArray(integrityResult)
      ? integrityResult.every(result => result === 'ok')
      : integrityResult === 'ok';

    if (!isIntegrityOk) {
      return false;
    }

    // Check that key tables exist
    const tables = db.pragma('table_list');
    const expectedTables = ['conversations', 'agents', 'messages', 'conversation_agents'];
    const tableNames = Array.isArray(tables) ? tables.map((t: { name: string }) => t.name) : [];

    return expectedTables.every(table => tableNames.includes(table));
  } catch (error) {
    console.error('Backup integrity validation failed:', error);
    return false;
  } finally {
    if (db) {
      db.close();
    }
  }
}
