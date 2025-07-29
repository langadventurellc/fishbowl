/**
 * @fileoverview Validation Service Interface
 *
 * Service interface for validation operations across multiple layers.
 */

import type { ValidationResult, BusinessRule, SecurityContext } from "../role";

/**
 * Validation Service Interface
 * Provides multi-layer validation for entities and business rules
 */
export interface ValidationService {
  /**
   * Validate entity against schema
   */
  validateEntity<T>(entity: T, schema: unknown): Promise<ValidationResult>;

  /**
   * Validate business rules for entity
   */
  validateBusinessRules<T>(
    entity: T,
    rules: BusinessRule[],
  ): Promise<ValidationResult>;

  /**
   * Validate security constraints
   */
  validateSecurityConstraints<T>(
    entity: T,
    context: SecurityContext,
  ): Promise<ValidationResult>;

  /**
   * Validate entity uniqueness constraints
   */
  validateUniqueness(
    entityType: string,
    field: string,
    value: string,
    excludeId?: string,
  ): Promise<ValidationResult>;

  /**
   * Validate cross-entity dependencies
   */
  validateDependencies(
    entityId: string,
    entityType: string,
  ): Promise<ValidationResult>;
}
