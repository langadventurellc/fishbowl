/**
 * Platform Capability Validation Pipeline
 *
 * This module provides a comprehensive three-stage validation pipeline for platform capability detection:
 *
 * 1. **PRE_DETECTION**: Validates capability definitions and detector configuration before detection begins
 * 2. **DURING_DETECTION**: Validates detection process and intermediate results during execution
 * 3. **POST_DETECTION**: Validates final detection results and applies consistency checks
 *
 * The validation pipeline ensures data integrity, security, and reliability of capability detection
 * while maintaining sub-2ms performance requirements and comprehensive error reporting.
 *
 * @example
 * ```typescript
 * import { CapabilityValidator, ValidationRuleRegistry, ValidationStage } from './validation';
 *
 * // Create registry and validator
 * const registry = new ValidationRuleRegistry();
 * const validator = new CapabilityValidator(registry);
 *
 * // Validate before detection
 * const preResult = await validator.validatePreDetection(capability, platformType);
 * if (!preResult.passed) {
 *   console.error('Pre-detection validation failed:', preResult.errors);
 * }
 *
 * // Validate after detection
 * const postResult = await validator.validatePostDetection(capability, detectionResult);
 * if (postResult.passed) {
 *   console.log('Detection result validated successfully');
 * }
 * ```
 */

// Core validation engine
export { CapabilityValidator } from './CapabilityValidator';
export type { CapabilityValidatorConfig } from './CapabilityValidatorConfig';
export { DEFAULT_CAPABILITY_VALIDATOR_CONFIG } from './DEFAULT_CAPABILITY_VALIDATOR_CONFIG';

// Validation rule management
export { ValidationRuleRegistry } from './ValidationRuleRegistry';
export type { ValidationRuleRegistryConfig } from './ValidationRuleRegistryConfig';
export type { ValidationRuleRegistryStats } from './ValidationRuleRegistryStats';

// Validation rule definitions
export type { ValidationRule } from './ValidationRule';
export type { ValidationContext } from './ValidationContext';
export type { ValidationRuleResult } from './ValidationRuleResult';
export type { ValidationRuleConfig } from './ValidationRuleConfig';
export { ValidationSeverity } from './ValidationSeverity';
export { DEFAULT_VALIDATION_RULE_CONFIG } from './DEFAULT_VALIDATION_RULE_CONFIG';

// Validation stages
export { ValidationStage } from './ValidationStage';

// Validation results
export type { ValidationResult } from './ValidationResult';
export type { ValidationStageSummary } from './ValidationStageSummary';
export type { ValidationPerformanceMetrics } from './ValidationPerformanceMetrics';
export { ValidationStatus } from './ValidationStatus';
export { createEmptyValidationResult } from './createEmptyValidationResult';
