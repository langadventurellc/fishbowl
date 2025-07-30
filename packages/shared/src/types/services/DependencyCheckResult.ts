/**
 * @fileoverview Dependency Check Result
 *
 * Result of dependency validation operations
 */

/**
 * Result of dependency validation operations
 */
export interface DependencyCheckResult {
  canDelete: boolean;
  dependentFiles: string[];
  blockingDependencies: string[];
  warnings: string[];
  errors: string[];
}
