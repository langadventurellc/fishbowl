/**
 * Migration definition for storage schema updates.
 *
 * Enables safe upgrades when storage structure changes
 * between application versions.
 *
 * @example
 * ```typescript
 * const migration_v2: LlmStorageMigration = {
 *   version: 2,
 *   migrate: async (data) => {
 *     const oldData = data as OldFormat;
 *     return {
 *       ...oldData,
 *       newField: 'default-value'
 *     };
 *   }
 * };
 * ```
 */

export interface LlmStorageMigration {
  /**
   * Target schema version.
   *
   * @remarks
   * Migrations are applied in order when current version < target version.
   */
  version: number;

  /**
   * Migration function to transform data.
   *
   * @param data - Data in previous format
   * @returns Data in new format
   */
  migrate: (data: unknown) => Promise<unknown>;
}
