/**
 * Load migration files from filesystem
 */
import fs from 'fs';
import path from 'path';
import { Migration } from './Migration';

export function loadMigrations(): Migration[] {
  // Try development path first, then production path
  const devPath = path.join(__dirname, '..', 'migrations');
  const prodPath = () => path.join(process.cwd(), 'src', 'main', 'database', 'migrations');

  const migrationsDir = fs.existsSync(devPath) ? devPath : prodPath();
  const migrations: Migration[] = [];

  if (!fs.existsSync(migrationsDir)) {
    return migrations;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const match = file.match(/^(\d+)-.*\.sql$/);
    if (match) {
      const version = parseInt(match[1], 10);
      const filepath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filepath, 'utf8');

      migrations.push({
        version,
        filename: file,
        sql,
      });
    }
  }

  return migrations.sort((a, b) => a.version - b.version);
}
