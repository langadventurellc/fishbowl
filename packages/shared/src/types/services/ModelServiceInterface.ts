/**
 * @fileoverview Model Service Interface
 *
 * Service interface for model configuration validation and management.
 * Provides model validation, capability checking, and cross-service compatibility analysis.
 */

import type { ValidationResult } from "../role";
import type { PersonalityConfiguration } from "../personality";
import type { CustomRole } from "../role";
import type {
  ModelConfiguration,
  ModelCapabilities,
  ModelConstraints,
  ModelFilters,
  CompatibilityResult,
} from "../model";

/**
 * Model Service Interface
 *
 * Provides comprehensive model configuration validation, capability management,
 * and cross-service compatibility checking for agent configuration workflows.
 */
export interface ModelService {
  /**
   * Validate model configuration against technical constraints
   *
   * Performs comprehensive validation of model configuration including:
   * - Schema validation
   * - Technical constraint compliance
   * - Provider availability verification
   * - Performance characteristic validation
   *
   * @param config - The model configuration to validate
   * @returns Promise resolving to validation result with detailed error context
   */
  validateModelConfiguration(
    config: ModelConfiguration,
  ): Promise<ValidationResult>;

  /**
   * Cross-service compatibility validation
   *
   * Analyzes compatibility between model capabilities and personality/role requirements:
   * - Capability alignment assessment
   * - Performance requirement matching
   * - Cost and constraint analysis
   * - Risk assessment and mitigation recommendations
   *
   * @param modelConfig - The model configuration to analyze
   * @param personalityConfig - The personality configuration for compatibility check
   * @param roleConfig - The role configuration for compatibility check
   * @returns Promise resolving to detailed compatibility analysis with recommendations
   */
  checkModelCompatibility(
    modelConfig: ModelConfiguration,
    personalityConfig: PersonalityConfiguration,
    roleConfig: CustomRole,
  ): Promise<CompatibilityResult>;

  /**
   * Retrieve detailed model capability information
   *
   * Fetches comprehensive capability data including:
   * - Technical specifications (context length, modalities)
   * - Performance characteristics (speed, throughput)
   * - Cost information (per-token pricing)
   * - Specialization areas
   *
   * @param modelId - The unique identifier of the model
   * @returns Promise resolving to detailed capabilities or null if model not found
   */
  getModelCapabilities(modelId: string): Promise<ModelCapabilities | null>;

  /**
   * List models available for agent configuration
   *
   * Retrieves models suitable for agent configuration with optional filtering:
   * - Availability status filtering
   * - Capability-based filtering
   * - Performance tier filtering
   * - Cost-based filtering
   *
   * @param filters - Optional filtering criteria for model selection
   * @returns Promise resolving to array of available models matching criteria
   */
  listAvailableModels(filters?: ModelFilters): Promise<ModelConfiguration[]>;

  /**
   * Validate model against specific operational constraints
   *
   * Performs constraint compliance validation including:
   * - Performance requirement verification
   * - Cost constraint validation
   * - Security requirement checking
   * - Capability requirement matching
   *
   * @param modelConfig - The model configuration to validate
   * @param constraints - The operational constraints to validate against
   * @returns Promise resolving to constraint compliance analysis
   */
  validateModelConstraints(
    modelConfig: ModelConfiguration,
    constraints: ModelConstraints,
  ): Promise<ValidationResult>;
}
