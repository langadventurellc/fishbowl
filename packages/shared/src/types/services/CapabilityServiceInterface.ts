/**
 * @fileoverview Capability Service Interface
 *
 * Service interface for capability definition, validation, and constraint management.
 * Handles technical validation of custom role capabilities and system requirement enforcement.
 */

import type { ValidationResult } from "../role";

/**
 * Capability Service Interface
 * Provides capability definition validation and constraint enforcement
 */
export interface CapabilityService {
  /**
   * Validate capability definition against technical constraints
   *
   * @param capability - The capability identifier to validate
   * @returns Promise resolving to validation result with technical constraint analysis
   */
  validateCapabilityDefinition(capability: string): Promise<ValidationResult>;

  /**
   * Validate capability combinations for technical conflicts
   *
   * @param capabilities - Array of capability identifiers to validate together
   * @returns Promise resolving to validation result indicating any conflicts
   */
  validateCapabilityCombination(
    capabilities: string[],
  ): Promise<ValidationResult>;

  /**
   * Validate capability scope against domain restrictions
   *
   * @param capability - The capability identifier to validate
   * @param domain - The domain context for scope validation
   * @returns Promise resolving to validation result for scope appropriateness
   */
  validateCapabilityScope(
    capability: string,
    domain: string,
  ): Promise<ValidationResult>;

  /**
   * Validate capability constraints against system requirements
   *
   * @param capability - The capability identifier to validate
   * @param constraints - Array of constraint identifiers to validate against
   * @returns Promise resolving to validation result for constraint compliance
   */
  validateCapabilityConstraints(
    capability: string,
    constraints: string[],
  ): Promise<ValidationResult>;
}
