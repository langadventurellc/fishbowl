/**
 * @fileoverview Dependency Service Interface
 *
 * Service interface for managing configuration file dependencies
 * with support for dependency checking, validation, and conflict resolution.
 */

import type { DependencyCheckResult } from "./DependencyCheckResult";
import type { DependencyInfo } from "./DependencyInfo";

/**
 * Dependency Service Interface
 * Handles dependency checking and validation for configuration files
 */
export interface DependencyService {
  /**
   * Check dependencies for a file before deletion
   */
  checkDependencies(filePath: string): Promise<DependencyCheckResult>;

  /**
   * Get all files that depend on the specified file
   */
  getDependentFiles(filePath: string): Promise<string[]>;

  /**
   * Get all files that the specified file depends on
   */
  getDependencies(filePath: string): Promise<string[]>;

  /**
   * Add a dependency relationship
   */
  addDependency(
    dependentFile: string,
    dependencyFile: string,
  ): Promise<boolean>;

  /**
   * Remove a dependency relationship
   */
  removeDependency(
    dependentFile: string,
    dependencyFile: string,
  ): Promise<boolean>;

  /**
   * Get detailed dependency information
   */
  getDependencyInfo(filePath: string): Promise<DependencyInfo>;

  /**
   * Validate that all dependencies are satisfied
   */
  validateDependencies(filePath: string): Promise<boolean>;
}
