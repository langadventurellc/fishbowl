/**
 * @fileoverview Dependency Info
 *
 * Detailed dependency information for configuration files
 */

/**
 * Detailed dependency information for configuration files
 */
export interface DependencyInfo {
  filePath: string;
  dependencies: string[];
  dependents: string[];
  circularDependencies: string[][];
  isValid: boolean;
  validationErrors: string[];
}
