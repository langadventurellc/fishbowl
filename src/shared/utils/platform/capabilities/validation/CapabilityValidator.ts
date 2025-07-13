import { CapabilityDetectionResult, PlatformCapability } from '../../../../types/platform';
import type { CapabilityValidatorConfig } from './CapabilityValidatorConfig';
import { createEmptyValidationResult } from './createEmptyValidationResult';
import { DEFAULT_CAPABILITY_VALIDATOR_CONFIG } from './DEFAULT_CAPABILITY_VALIDATOR_CONFIG';
import type { ValidationContext } from './ValidationContext';
import type { ValidationPerformanceMetrics } from './ValidationPerformanceMetrics';
import type { ValidationResult } from './ValidationResult';
import type { ValidationRule } from './ValidationRule';
import type { ValidationRuleRegistry } from './ValidationRuleRegistry';
import type { ValidationRuleResult } from './ValidationRuleResult';
import { ValidationSeverity } from './ValidationSeverity';
import { ValidationStage } from './ValidationStage';
import type { ValidationStageSummary } from './ValidationStageSummary';
import { ValidationStatus, ValidationStatus as ValidationStatusEnum } from './ValidationStatus';

/**
 * Core capability validation engine
 *
 * The CapabilityValidator orchestrates the three-stage validation pipeline,
 * executing validation rules in order of priority and collecting comprehensive
 * results for analysis and decision-making.
 */
export class CapabilityValidator {
  private readonly config: CapabilityValidatorConfig;
  private readonly ruleRegistry: ValidationRuleRegistry;

  /**
   * Creates a new capability validator
   *
   * @param ruleRegistry - Registry containing validation rules
   * @param config - Configuration for the validator
   */
  constructor(
    ruleRegistry: ValidationRuleRegistry,
    config: Partial<CapabilityValidatorConfig> = {},
  ) {
    this.ruleRegistry = ruleRegistry;
    this.config = { ...DEFAULT_CAPABILITY_VALIDATOR_CONFIG, ...config };
  }

  /**
   * Validates a capability before detection begins (PRE_DETECTION stage)
   *
   * @param capability - The capability to validate
   * @param platformType - Optional platform type for context
   * @param metadata - Optional additional metadata
   * @returns Promise resolving to validation result
   */
  async validatePreDetection(
    capability: PlatformCapability,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationResult> {
    if (
      !this.config.enabled ||
      !this.config.enabledStages.includes(ValidationStage.PRE_DETECTION)
    ) {
      return createEmptyValidationResult(capability.id);
    }

    const context: ValidationContext = {
      capability,
      stage: ValidationStage.PRE_DETECTION,
      startTime: Date.now(),
      platformType,
      metadata,
    };

    return this.executeValidationStage(context);
  }

  /**
   * Validates during the detection process (DURING_DETECTION stage)
   *
   * @param capability - The capability being detected
   * @param intermediateData - Intermediate data from detection process
   * @param platformType - Optional platform type for context
   * @param metadata - Optional additional metadata
   * @returns Promise resolving to validation result
   */
  async validateDuringDetection(
    capability: PlatformCapability,
    intermediateData: Record<string, unknown>,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationResult> {
    if (
      !this.config.enabled ||
      !this.config.enabledStages.includes(ValidationStage.DURING_DETECTION)
    ) {
      return createEmptyValidationResult(capability.id);
    }

    const context: ValidationContext = {
      capability,
      stage: ValidationStage.DURING_DETECTION,
      intermediateData,
      startTime: Date.now(),
      platformType,
      metadata,
    };

    return this.executeValidationStage(context);
  }

  /**
   * Validates detection results after detection completes (POST_DETECTION stage)
   *
   * @param capability - The capability that was detected
   * @param detectionResult - The result of capability detection
   * @param platformType - Optional platform type for context
   * @param metadata - Optional additional metadata
   * @returns Promise resolving to validation result
   */
  async validatePostDetection(
    capability: PlatformCapability,
    detectionResult: CapabilityDetectionResult,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationResult> {
    if (
      !this.config.enabled ||
      !this.config.enabledStages.includes(ValidationStage.POST_DETECTION)
    ) {
      return createEmptyValidationResult(capability.id);
    }

    const context: ValidationContext = {
      capability,
      stage: ValidationStage.POST_DETECTION,
      detectionResult,
      startTime: Date.now(),
      platformType,
      metadata,
    };

    return this.executeValidationStage(context);
  }

  /**
   * Executes the complete validation pipeline for all enabled stages
   *
   * @param capability - The capability to validate
   * @param detectionResult - Optional detection result (for POST_DETECTION)
   * @param intermediateData - Optional intermediate data (for DURING_DETECTION)
   * @param platformType - Optional platform type for context
   * @param metadata - Optional additional metadata
   * @returns Promise resolving to comprehensive validation result
   */
  async validateComplete(
    capability: PlatformCapability,
    detectionResult?: CapabilityDetectionResult,
    intermediateData?: Record<string, unknown>,
    platformType?: string,
    metadata?: Record<string, unknown>,
  ): Promise<ValidationResult> {
    if (!this.config.enabled) {
      return createEmptyValidationResult(capability.id);
    }

    const startTime = Date.now();
    const allResults: ValidationResult[] = [];

    // Execute each enabled stage in order
    for (const stage of this.config.enabledStages) {
      const context: ValidationContext = {
        capability,
        stage,
        detectionResult,
        intermediateData,
        startTime,
        platformType,
        metadata,
      };

      const stageResult = await this.executeValidationStage(context);
      allResults.push(stageResult);

      // Stop if critical failure and configured to not continue
      if (!stageResult.allowContinue && !this.config.continueAfterCritical) {
        break;
      }
    }

    // Combine results from all stages
    return this.combineValidationResults(allResults, capability.id, startTime);
  }

  /**
   * Executes validation rules for a specific stage
   *
   * @param context - Validation context
   * @returns Promise resolving to validation result for the stage
   */
  private async executeValidationStage(context: ValidationContext): Promise<ValidationResult> {
    const result = createEmptyValidationResult(context.capability.id);
    result.startTime = context.startTime;
    result.metadata.platformType = context.platformType;

    const rules = this.ruleRegistry.getRulesForStage(
      context.stage,
      context.capability.id,
      context.platformType,
    );

    if (rules.length === 0) {
      result.endTime = Date.now();
      return result;
    }

    const stageStartTime = performance.now();
    const ruleResults: ValidationRuleResult[] = [];
    let memoryUsage = 0;

    for (const rule of rules) {
      try {
        // Check memory limit
        if (this.config.collectPerformanceMetrics) {
          const estimatedMemory = this.estimateMemoryUsage();
          if (estimatedMemory > this.config.memoryLimitBytes) {
            this.addError(
              result,
              rule.id,
              'Memory limit exceeded during validation',
              context.stage,
              'ERROR',
            );
            break;
          }
          memoryUsage = Math.max(memoryUsage, estimatedMemory);
        }

        // Check global timeout
        const elapsedTime = Date.now() - context.startTime;
        if (elapsedTime > this.config.maxValidationTimeMs) {
          this.addError(
            result,
            rule.id,
            'Global validation timeout exceeded',
            context.stage,
            'ERROR',
          );
          break;
        }

        // Execute rule with timeout
        const ruleResult = await this.executeRuleWithTimeout(rule, context);
        ruleResults.push(ruleResult);

        // Process rule result
        this.processRuleResult(result, rule, ruleResult, context.stage);

        // Stop if critical failure and rule doesn't allow continuation
        if (!ruleResult.passed && !ruleResult.continueOnFailure) {
          result.allowContinue = false;
          if (!this.config.continueAfterCritical) {
            break;
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error during rule execution';
        this.addError(result, rule.id, errorMessage, context.stage, 'CRITICAL');

        result.allowContinue = false;
        if (!this.config.continueAfterCritical) {
          break;
        }
      }
    }

    // Calculate performance metrics
    const stageEndTime = performance.now();
    const stageExecutionTime = stageEndTime - stageStartTime;

    if (this.config.collectPerformanceMetrics) {
      result.performance = this.calculatePerformanceMetrics(
        ruleResults,
        stageExecutionTime,
        memoryUsage,
        context.stage,
      );
    }

    // Create stage summary
    const stageSummary = this.createStageSummary(context.stage, ruleResults, stageExecutionTime);
    result.stageSummaries.push(stageSummary);

    // Update overall status
    result.status = this.determineValidationStatus(result);
    result.passed = result.status !== ValidationStatus.FAILED_STOP;
    result.endTime = Date.now();

    return result;
  }

  /**
   * Executes a validation rule with timeout protection
   *
   * @param rule - The validation rule to execute
   * @param context - Validation context
   * @returns Promise resolving to rule result
   */
  private async executeRuleWithTimeout(
    rule: ValidationRule,
    context: ValidationContext,
  ): Promise<ValidationRuleResult> {
    const ruleStartTime = performance.now();

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<ValidationRuleResult>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Rule '${rule.id}' exceeded timeout of ${rule.config.timeoutMs}ms`));
        }, rule.config.timeoutMs);
      });

      // Race between rule execution and timeout
      const result = await Promise.race([rule.validate(context), timeoutPromise]);

      // Ensure execution time is recorded
      const executionTime = performance.now() - ruleStartTime;
      return {
        ...result,
        executionTimeMs: executionTime,
      };
    } catch (error: unknown) {
      const executionTime = performance.now() - ruleStartTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown rule execution error';

      return {
        passed: false,
        severity: 'ERROR' as ValidationSeverity,
        message: errorMessage,
        continueOnFailure: true,
        executionTimeMs: executionTime,
        suggestions: [`Review rule '${rule.id}' implementation and timeout configuration`],
      };
    }
  }

  /**
   * Processes the result of a validation rule execution
   *
   * @param result - The overall validation result to update
   * @param rule - The rule that was executed
   * @param ruleResult - The result of rule execution
   * @param stage - The validation stage
   */
  private processRuleResult(
    result: ValidationResult,
    rule: ValidationRule,
    ruleResult: ValidationRuleResult,
    stage: ValidationStage,
  ): void {
    result.ruleResults.push(ruleResult);

    if (!ruleResult.passed) {
      this.addError(result, rule.id, ruleResult.message, stage, ruleResult.severity);
    }

    if (ruleResult.severity === ValidationSeverity.WARNING) {
      result.warnings.push({
        ruleId: rule.id,
        message: ruleResult.message,
        details: ruleResult.details,
        stage,
      });
    }

    if (ruleResult.severity === ValidationSeverity.INFO) {
      result.info.push({
        ruleId: rule.id,
        message: ruleResult.message,
        details: ruleResult.details,
        stage,
      });
    }

    if (ruleResult.suggestions) {
      for (const suggestion of ruleResult.suggestions) {
        result.suggestions.push({
          ruleId: rule.id,
          suggestion,
          priority: this.determineSuggestionPriority(ruleResult.severity),
          category: this.determineSuggestionCategory(rule.name),
        });
      }
    }
  }

  /**
   * Adds an error to the validation result
   */
  private addError(
    result: ValidationResult,
    ruleId: string,
    message: string,
    stage: ValidationStage,
    severity: ValidationSeverity | string,
  ): void {
    result.errors.push({
      ruleId,
      message,
      stage,
      severity: severity as ValidationSeverity,
    });
  }

  /**
   * Calculates performance metrics for validation execution
   */
  private calculatePerformanceMetrics(
    ruleResults: ValidationRuleResult[],
    stageExecutionTime: number,
    memoryUsage: number,
    stage: ValidationStage,
  ): ValidationPerformanceMetrics {
    const totalRulesExecuted = ruleResults.length;
    const totalExecutionTime = ruleResults.reduce((sum, r) => sum + r.executionTimeMs, 0);
    const maxExecutionTime = Math.max(...ruleResults.map(r => r.executionTimeMs), 0);
    const averageExecutionTime =
      totalRulesExecuted > 0 ? totalExecutionTime / totalRulesExecuted : 0;

    return {
      totalExecutionTimeMs: stageExecutionTime,
      stageExecutionTimes: {
        [ValidationStage.PRE_DETECTION]:
          stage === ValidationStage.PRE_DETECTION ? stageExecutionTime : 0,
        [ValidationStage.DURING_DETECTION]:
          stage === ValidationStage.DURING_DETECTION ? stageExecutionTime : 0,
        [ValidationStage.POST_DETECTION]:
          stage === ValidationStage.POST_DETECTION ? stageExecutionTime : 0,
      },
      totalRulesExecuted,
      averageRuleExecutionMs: averageExecutionTime,
      maxRuleExecutionMs: maxExecutionTime,
      timedOutRules: 0, // Would need to track this separately
      memoryUsageBytes: memoryUsage,
    };
  }

  /**
   * Creates a summary for a validation stage
   */
  private createStageSummary(
    stage: ValidationStage,
    ruleResults: ValidationRuleResult[],
    executionTime: number,
  ): ValidationStageSummary {
    const totalRules = ruleResults.length;
    const passedRules = ruleResults.filter(r => r.passed).length;
    const failedRules = ruleResults.filter(r => !r.passed).length;
    const warningRules = ruleResults.filter(r => r.severity === ValidationSeverity.WARNING).length;

    return {
      stage,
      totalRules,
      passedRules,
      failedRules,
      warningRules,
      executionTimeMs: executionTime,
      stagePassed: failedRules === 0 || ruleResults.every(r => r.continueOnFailure),
    };
  }

  /**
   * Determines the overall validation status
   */
  private determineValidationStatus(result: ValidationResult): ValidationStatus {
    const hasCriticalErrors = result.errors.some(e => e.severity === ValidationSeverity.CRITICAL);
    const hasErrors = result.errors.some(e => e.severity === ValidationSeverity.ERROR);
    const hasWarnings = result.warnings.length > 0;

    if (hasCriticalErrors || (hasErrors && !result.allowContinue)) {
      return ValidationStatusEnum.FAILED_STOP;
    }

    if (hasErrors && result.allowContinue) {
      return ValidationStatusEnum.FAILED_CONTINUE;
    }

    if (hasWarnings) {
      return ValidationStatusEnum.PASSED_WITH_WARNINGS;
    }

    return ValidationStatusEnum.PASSED;
  }

  /**
   * Combines results from multiple validation stages
   */
  private combineValidationResults(
    results: ValidationResult[],
    capabilityId: string,
    startTime: number,
  ): ValidationResult {
    const combined = createEmptyValidationResult(capabilityId);
    combined.startTime = startTime;
    combined.endTime = Date.now();

    // Combine all results
    for (const result of results) {
      combined.ruleResults.push(...result.ruleResults);
      combined.errors.push(...result.errors);
      combined.warnings.push(...result.warnings);
      combined.info.push(...result.info);
      combined.suggestions.push(...result.suggestions);
      combined.stageSummaries.push(...result.stageSummaries);

      // Update overall state
      if (!result.allowContinue) {
        combined.allowContinue = false;
      }
    }

    // Calculate combined performance metrics
    if (this.config.collectPerformanceMetrics && results.length > 0) {
      const totalExecutionTime = results.reduce(
        (sum, r) => sum + r.performance.totalExecutionTimeMs,
        0,
      );
      const maxMemoryUsage = Math.max(...results.map(r => r.performance.memoryUsageBytes));

      combined.performance = {
        totalExecutionTimeMs: totalExecutionTime,
        stageExecutionTimes: results.reduce(
          (acc, r) => {
            for (const [stage, time] of Object.entries(r.performance.stageExecutionTimes)) {
              acc[stage as ValidationStage] += time;
            }
            return acc;
          },
          { ...combined.performance.stageExecutionTimes },
        ),
        totalRulesExecuted: combined.ruleResults.length,
        averageRuleExecutionMs:
          combined.ruleResults.length > 0
            ? combined.ruleResults.reduce((sum, r) => sum + r.executionTimeMs, 0) /
              combined.ruleResults.length
            : 0,
        maxRuleExecutionMs: Math.max(...combined.ruleResults.map(r => r.executionTimeMs), 0),
        timedOutRules: 0, // Would need to track this
        memoryUsageBytes: maxMemoryUsage,
      };
    }

    // Determine final status
    combined.status = this.determineValidationStatus(combined);
    combined.passed = combined.status !== ValidationStatus.FAILED_STOP;

    return combined;
  }

  /**
   * Estimates current memory usage
   */
  private estimateMemoryUsage(): number {
    // Simplified memory estimation - in real implementation would use
    // performance.memory or similar monitoring
    return 1024; // Placeholder
  }

  /**
   * Determines suggestion priority based on severity
   */
  private determineSuggestionPriority(severity: ValidationSeverity): 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (severity) {
      case ValidationSeverity.CRITICAL:
      case ValidationSeverity.ERROR:
        return 'HIGH';
      case ValidationSeverity.WARNING:
        return 'MEDIUM';
      case ValidationSeverity.INFO:
      default:
        return 'LOW';
    }
  }

  /**
   * Determines suggestion category based on rule name
   */
  private determineSuggestionCategory(
    ruleName: string,
  ): 'SECURITY' | 'PERFORMANCE' | 'RELIABILITY' | 'COMPATIBILITY' {
    const lowerName = ruleName.toLowerCase();

    if (lowerName.includes('security') || lowerName.includes('permission')) {
      return 'SECURITY';
    }
    if (lowerName.includes('performance') || lowerName.includes('timing')) {
      return 'PERFORMANCE';
    }
    if (lowerName.includes('compatibility') || lowerName.includes('platform')) {
      return 'COMPATIBILITY';
    }

    return 'RELIABILITY';
  }
}
