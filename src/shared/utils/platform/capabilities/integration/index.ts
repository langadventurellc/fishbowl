/**
 * Platform capability validation and fallback integration utilities
 *
 * This module provides comprehensive integration between the validation and fallback
 * systems, enabling automatic validation-driven fallback execution, capability
 * requirement analysis, dependency validation, and permission-based fallback handling.
 *
 * Key Components:
 * - ValidationFallbackOrchestrator: Coordinates validation and fallback pipeline
 * - CapabilityRequirementAnalyzer: Analyzes requirements and suggests alternatives
 * - DependencyValidator: Validates capability dependencies and provides fallback chains
 * - PermissionBasedFallback: Handles permission-denied scenarios
 *
 * @example
 * ```typescript
 * import {
 *   ValidationFallbackOrchestrator,
 *   CapabilityRequirementAnalyzer,
 *   DependencyValidator,
 *   PermissionBasedFallback
 * } from './capabilities/integration';
 *
 * // Orchestrate validation and fallback
 * const orchestrator = new ValidationFallbackOrchestrator(validator, executor);
 * const result = await orchestrator.validateAndExecuteFallback(capability, detectionResult);
 *
 * // Analyze capability requirements
 * const analyzer = new CapabilityRequirementAnalyzer();
 * const analysis = await analyzer.analyzeFailedRequirement(capability, result, 'ELECTRON');
 *
 * // Validate dependencies
 * const depValidator = new DependencyValidator();
 * const depResult = await depValidator.validateDependencyChain(capability, deps, 'ELECTRON');
 *
 * // Handle permission issues
 * const permissionFallback = new PermissionBasedFallback();
 * const permAnalysis = await permissionFallback.analyzePermissionFailure(capability, result, 'ELECTRON');
 * ```
 */

// Core integration components
export { ValidationFallbackOrchestrator } from './ValidationFallbackOrchestrator';
export { CapabilityRequirementAnalyzer } from './CapabilityRequirementAnalyzer';
export { DependencyValidator } from './DependencyValidator';
export { PermissionBasedFallback } from './PermissionBasedFallback';

// Configuration and result types
export type { ValidationFallbackConfig } from './ValidationFallbackConfig';
export type { ValidationFallbackResult } from './ValidationFallbackResult';
export { DEFAULT_VALIDATION_FALLBACK_CONFIG } from './DEFAULT_VALIDATION_FALLBACK_CONFIG';

// Requirement analysis types
export type { CapabilityRequirementAnalysis } from './CapabilityRequirementAnalysis';
export type { ReducedFeatureSet } from './ReducedFeatureSet';
export type { CapabilityAlternative } from './CapabilityAlternative';

// Dependency validation types
export type { CapabilityDependencyChain } from './CapabilityDependencyChain';
export type { DependencyValidationResult } from './DependencyValidationResult';
export type { FallbackChain } from './FallbackChain';

// Permission-based fallback types
export type { PermissionFallbackStrategy } from './PermissionFallbackStrategy';
export type { PermissionAnalysisResult } from './PermissionAnalysisResult';
export type { PermissionAlternative } from './PermissionAlternative';
