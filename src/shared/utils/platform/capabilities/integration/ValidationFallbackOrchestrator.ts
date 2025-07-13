import type {
  CapabilityDetectionResult,
  PlatformCapability,
  PlatformCapabilityId,
} from '../../../../types/platform';
import type { PlatformType } from '../../../../constants/platform';
import type { FallbackApplicationContext } from '../fallback/FallbackApplicationContext';
import type { FallbackExecutionResult } from '../fallback/FallbackExecutionResult';
import type { FallbackExecutor } from '../fallback/FallbackExecutor';
import type { CapabilityValidator } from '../validation/CapabilityValidator';
import type { ValidationResult } from '../validation/ValidationResult';
import { ValidationStatus } from '../validation/ValidationStatus';
import { DEFAULT_VALIDATION_FALLBACK_CONFIG } from './DEFAULT_VALIDATION_FALLBACK_CONFIG';
import type { ValidationFallbackConfig } from './ValidationFallbackConfig';
import type { ValidationFallbackResult } from './ValidationFallbackResult';

/**
 * Orchestrates validation and fallback pipeline integration
 *
 * The ValidationFallbackOrchestrator coordinates the execution of capability validation
 * and fallback strategies, providing a unified interface that bridges the validation
 * and fallback systems. It transforms validation results into fallback contexts and
 * combines results for comprehensive capability handling.
 *
 * Key Features:
 * - Automatic validation-to-fallback pipeline execution
 * - Performance monitoring with sub-2ms validation, sub-5ms fallback requirements
 * - Intelligent triggering of fallback based on validation status
 * - Unified result aggregation with detailed metrics
 * - Configurable validation and fallback behavior
 * - Error handling with graceful degradation
 *
 * @example
 * ```typescript
 * const orchestrator = new ValidationFallbackOrchestrator(validator, executor);
 *
 * const result = await orchestrator.validateAndExecuteFallback(
 *   capability,
 *   detectionResult,
 *   {
 *     platformType: 'ELECTRON',
 *     enableValidation: true,
 *     enableFallback: true
 *   }
 * );
 *
 * if (result.success) {
 *   console.log(`Processing completed: ${result.message}`);
 *   console.log(`Recommendations: ${result.combinedRecommendations.join(', ')}`);
 * }
 * ```
 */
export class ValidationFallbackOrchestrator {
  private readonly validator: CapabilityValidator;
  private readonly executor: FallbackExecutor;
  private readonly config: ValidationFallbackConfig;

  /**
   * Creates a new ValidationFallbackOrchestrator instance
   *
   * @param validator - Capability validator for validation pipeline execution
   * @param executor - Fallback executor for strategy execution
   * @param config - Configuration for orchestration behavior
   */
  constructor(
    validator: CapabilityValidator,
    executor: FallbackExecutor,
    config: Partial<ValidationFallbackConfig> = {},
  ) {
    this.validator = validator;
    this.executor = executor;
    this.config = { ...DEFAULT_VALIDATION_FALLBACK_CONFIG, ...config };
  }

  /**
   * Executes validation and fallback pipeline for a capability detection result
   *
   * @param capability - The capability that was detected
   * @param detectionResult - The result of capability detection
   * @param platformType - Platform type for context (optional)
   * @param metadata - Additional metadata for validation context (optional)
   * @returns Promise resolving to unified validation and fallback result
   */
  async validateAndExecuteFallback(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationFallbackResult> {
    const orchestrationStartTime = performance.now();
    const initialMemory = this.config.enableMemoryTracking ? this.estimateMemoryUsage() : 0;

    let validationResult: ValidationResult | undefined;
    let fallbackResult: FallbackExecutionResult | undefined;
    let shouldExecuteFallback = false;

    try {
      // Step 1: Execute validation pipeline if enabled
      if (this.config.enableValidation) {
        validationResult = await this.executeValidationPipeline(
          capability,
          detectionResult,
          platformType,
          metadata,
        );

        // Determine if fallback should be executed based on validation
        shouldExecuteFallback = this.shouldExecuteFallback(detectionResult, validationResult);
      } else {
        // If validation disabled, check detection result directly
        shouldExecuteFallback = this.shouldExecuteFallbackFromDetection(detectionResult);
      }

      // Step 2: Execute fallback pipeline if needed and enabled
      if (shouldExecuteFallback && this.config.enableFallback) {
        const fallbackContext = this.createFallbackContext(
          capability,
          detectionResult,
          validationResult,
          platformType,
          metadata,
        );

        fallbackResult = await this.executor.executeFallbackStrategies(
          capability.id as PlatformCapabilityId,
          fallbackContext,
        );
      }

      // Step 3: Combine results and create unified response
      const totalExecutionTime = performance.now() - orchestrationStartTime;
      const memoryUsage = this.config.enableMemoryTracking
        ? this.estimateMemoryUsage() - initialMemory
        : 0;

      return this.createUnifiedResult(
        capability,
        detectionResult,
        validationResult,
        fallbackResult,
        totalExecutionTime,
        memoryUsage,
      );
    } catch (error) {
      // Handle orchestration errors gracefully
      return this.createErrorResult(
        capability,
        detectionResult,
        error,
        performance.now() - orchestrationStartTime,
      );
    }
  }

  /**
   * Executes only the validation pipeline without fallback
   *
   * @param capability - The capability to validate
   * @param detectionResult - The detection result to validate
   * @param platformType - Platform type for context
   * @param metadata - Additional metadata
   * @returns Promise resolving to validation result
   */
  async validateOnly(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationResult> {
    if (!this.config.enableValidation) {
      throw new Error('Validation is disabled in configuration');
    }

    return this.executeValidationPipeline(capability, detectionResult, platformType, metadata);
  }

  /**
   * Executes only the fallback pipeline without validation
   *
   * @param capability - The capability that failed
   * @param detectionResult - The detection result
   * @param platformType - Platform type for context
   * @param metadata - Additional metadata
   * @returns Promise resolving to fallback execution result
   */
  async fallbackOnly(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<FallbackExecutionResult> {
    if (!this.config.enableFallback) {
      throw new Error('Fallback is disabled in configuration');
    }

    const fallbackContext = this.createFallbackContext(
      capability,
      detectionResult,
      undefined,
      platformType,
      metadata,
    );

    return this.executor.executeFallbackStrategies(
      capability.id as PlatformCapabilityId,
      fallbackContext,
    );
  }

  /**
   * Executes the validation pipeline with performance monitoring
   */
  private async executeValidationPipeline(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationResult> {
    const validationStartTime = performance.now();

    try {
      // Execute post-detection validation (most common case)
      const result = await this.validator.validatePostDetection(
        capability,
        detectionResult,
        platformType,
        metadata,
      );

      // Check performance requirement (sub-2ms)
      const validationTime = performance.now() - validationStartTime;
      if (validationTime > this.config.maxValidationTimeMs) {
        result.warnings.push({
          ruleId: 'orchestrator-performance',
          message: `Validation exceeded performance target: ${validationTime.toFixed(2)}ms`,
          stage: result.stageSummaries[0]?.stage,
        });
      }

      return result;
    } catch (error) {
      throw new Error(
        `Validation pipeline failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Determines if fallback should be executed based on validation results
   */
  private shouldExecuteFallback(
    detectionResult: CapabilityDetectionResult,
    validationResult: ValidationResult,
  ): boolean {
    // Execute fallback if validation suggests it
    if (validationResult.status === ValidationStatus.FAILED_STOP) {
      return true;
    }

    // Execute fallback if detection failed and validation allows continuation
    if (!detectionResult.available && validationResult.allowContinue) {
      return true;
    }

    // Execute fallback if there are high-priority suggestions for alternatives
    return validationResult.suggestions.some(
      s => s.priority === 'HIGH' && s.category === 'COMPATIBILITY',
    );
  }

  /**
   * Determines if fallback should be executed based on detection result only
   */
  private shouldExecuteFallbackFromDetection(detectionResult: CapabilityDetectionResult): boolean {
    // Execute fallback if capability is not available
    if (!detectionResult.available) {
      return true;
    }

    // Execute fallback if permissions were denied
    if (!detectionResult.permissionsGranted && detectionResult.requiredPermissions.length > 0) {
      return true;
    }

    // Execute fallback if there are fallback options suggested
    return Boolean(detectionResult.fallbackOptions && detectionResult.fallbackOptions.length > 0);
  }

  /**
   * Creates fallback application context from validation and detection results
   */
  private createFallbackContext(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    validationResult?: ValidationResult,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): FallbackApplicationContext {
    // Extract failure reasons from validation and detection
    const failureReasons: string[] = [];

    if (!detectionResult.available) {
      failureReasons.push('Capability not available');
    }

    if (!detectionResult.permissionsGranted) {
      failureReasons.push('Required permissions not granted');
    }

    if (validationResult) {
      failureReasons.push(...validationResult.errors.map(e => e.message));
    }

    // Combine evidence from detection and validation
    const evidence = [...detectionResult.evidence];
    if (validationResult) {
      evidence.push(...validationResult.ruleResults.map(r => r.message));
    }

    return {
      capabilityId: capability.id as PlatformCapabilityId,
      platformType: (platformType ?? 'UNKNOWN') as PlatformType,
      detectionResult,
      platformContext: {
        failureReasons,
        evidence,
        validationErrors: validationResult?.errors ?? [],
        availableAlternatives: detectionResult.fallbackOptions ?? [],
        permissionIssues: !detectionResult.permissionsGranted,
        ...metadata,
      },
      userPreferences: {
        validationStatus: validationResult?.status,
        validationAllowContinue: validationResult?.allowContinue,
      },
      executionStartTime: performance.now(),
    };
  }

  /**
   * Creates unified result combining validation and fallback results
   */
  private createUnifiedResult(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    validationResult?: ValidationResult,
    fallbackResult?: FallbackExecutionResult,
    totalExecutionTime?: number,
    memoryUsage?: number,
  ): ValidationFallbackResult {
    // Determine overall success
    const detectionSuccess = detectionResult.available;
    const validationSuccess = validationResult?.passed !== false;
    const fallbackSuccess = fallbackResult?.success ?? false;

    const overallSuccess = detectionSuccess || (validationSuccess && fallbackSuccess);

    // Combine recommendations
    const combinedRecommendations: string[] = [];

    if (validationResult) {
      combinedRecommendations.push(...validationResult.suggestions.map(s => s.suggestion));
    }

    if (fallbackResult) {
      combinedRecommendations.push(...fallbackResult.combinedRecommendations);
    }

    // Create comprehensive message
    let message = `Capability '${capability.id}' `;
    if (detectionSuccess) {
      message += 'detected successfully';
    } else if (fallbackSuccess) {
      message += 'fallback applied successfully';
    } else {
      message += 'processing completed with issues';
    }

    return {
      capability,
      detectionResult,
      validationResult,
      fallbackResult,
      success: overallSuccess,
      message,
      combinedRecommendations: Array.from(new Set(combinedRecommendations)),
      totalExecutionTimeMs: totalExecutionTime ?? 0,
      memoryUsageBytes: memoryUsage ?? 0,
      performanceMetrics: {
        validationTimeMs: validationResult?.performance?.totalExecutionTimeMs ?? 0,
        fallbackTimeMs: fallbackResult?.metrics?.totalExecutionTimeMs ?? 0,
        orchestrationOverheadMs: Math.max(
          0,
          (totalExecutionTime ?? 0) -
            (validationResult?.performance?.totalExecutionTimeMs ?? 0) -
            (fallbackResult?.metrics?.totalExecutionTimeMs ?? 0),
        ),
        memoryUsageBytes: memoryUsage ?? 0,
        metPerformanceTargets: {
          validationTarget:
            (validationResult?.performance?.totalExecutionTimeMs ?? 0) <=
            this.config.maxValidationTimeMs,
          fallbackTarget:
            (fallbackResult?.metrics?.totalExecutionTimeMs ?? 0) <= this.config.maxFallbackTimeMs,
        },
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Creates error result for orchestration failures
   */
  private createErrorResult(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    error: unknown,
    executionTime: number,
  ): ValidationFallbackResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      capability,
      detectionResult,
      success: false,
      message: `Orchestration failed: ${errorMessage}`,
      combinedRecommendations: [
        'Review orchestration configuration',
        'Check validation and fallback system status',
        'Retry operation with different configuration',
      ],
      totalExecutionTimeMs: executionTime,
      memoryUsageBytes: 0,
      performanceMetrics: {
        validationTimeMs: 0,
        fallbackTimeMs: 0,
        orchestrationOverheadMs: executionTime,
        memoryUsageBytes: 0,
        metPerformanceTargets: {
          validationTarget: false,
          fallbackTarget: false,
        },
      },
      timestamp: Date.now(),
      errors: [error instanceof Error ? error : new Error(String(error))],
    };
  }

  /**
   * Estimates current memory usage for performance monitoring
   */
  private estimateMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance.memory as { usedJSHeapSize: number }).usedJSHeapSize ?? 0;
    }
    return 0;
  }
}
