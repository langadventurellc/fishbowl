/**
 * Represents a migration operation type.
 * Used for categorizing and logging migration activities.
 */
export enum MigrationOperation {
  /**
   * Applying a migration to the database (forward migration).
   */
  APPLY = "apply",

  /**
   * Rolling back a migration from the database (reverse migration).
   */
  ROLLBACK = "rollback",

  /**
   * Discovering available migrations from the file system.
   */
  DISCOVER = "discover",

  /**
   * Validating migration files and their order.
   */
  VALIDATE = "validate",

  /**
   * Creating or updating the migration tracking table.
   */
  INITIALIZE = "initialize",
}
