/**
 * @fileoverview Reference Service Interface
 * Cross-service reference validation, dependency tracking, and integrity enforcement
 */

import type { ValidationResult } from "../role/ValidationResult";
import type { ReferenceValidationRequest } from "./ReferenceValidationRequest";
import type { DependencyGraph } from "./DependencyGraph";
import type { ReferenceResolutionResult } from "./ReferenceResolutionResult";

export interface ReferenceService {
  /**
   * Validate cross-service reference integrity
   */
  validateReference(
    request: ReferenceValidationRequest,
  ): Promise<ValidationResult>;

  /**
   * Track dependencies for entity with dependency graph construction
   */
  trackDependencies(
    entityId: string,
    entityType: string,
  ): Promise<DependencyGraph>;

  /**
   * Detect circular references in dependency graph
   */
  detectCircularReferences(entityId: string): Promise<{
    hasCircularReferences: boolean;
    cycles: string[][];
    affectedEntities: string[];
  }>;

  /**
   * Enforce referential integrity constraints
   */
  enforceIntegrity(
    entityId: string,
    entityType: string,
  ): Promise<ValidationResult>;

  /**
   * Resolve single reference with caching and performance optimization
   */
  resolveReferences(referenceIds: string[]): Promise<ReferenceResolutionResult>;

  /**
   * Batch resolve multiple references with performance optimization
   */
  batchResolveReferences(
    requests: ReferenceValidationRequest[],
  ): Promise<ReferenceResolutionResult>;
}
