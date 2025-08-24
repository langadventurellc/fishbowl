/**
 * Represents a discovered migration file from the file system.
 * Contains metadata needed for ordering and executing migrations.
 *
 * @example
 * ```typescript
 * const migrationFile: MigrationFile = {
 *   filename: "001_create_users_table.sql",
 *   order: 1,
 *   path: "/migrations/001_create_users_table.sql"
 * };
 * ```
 */
export interface MigrationFile {
  /**
   * The migration filename with extension (e.g., "001_create_users_table.sql").
   * Must follow the naming convention: {order}_{description}.sql
   */
  filename: string;

  /**
   * Numeric order extracted from the filename prefix (e.g., 1, 2, 3).
   * Used for determining execution order of migrations.
   */
  order: number;

  /**
   * Full absolute path to the migration file on the file system.
   * Used for reading the migration SQL content.
   */
  path: string;
}
