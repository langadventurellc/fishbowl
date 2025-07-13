import { z } from 'zod';
import { ValidationStage } from '../../../utils/platform/capabilities/validation/ValidationStage';

/**
 * Zod schema for validation configuration with comprehensive bounds checking.
 *
 * Validates capability validation pipeline configuration to ensure safe
 * operation within performance and resource constraints. Includes validation
 * for time limits, memory constraints, and configuration consistency.
 *
 * @example
 * ```typescript
 * import { CapabilityValidationConfigSchema } from './CapabilityValidationConfigSchema';
 *
 * const config = {
 *   enabled: true,
 *   maxValidationTimeMs: 2000,
 *   continueAfterCritical: false,
 *   collectPerformanceMetrics: true,
 *   memoryLimitBytes: 1048576,
 *   validateRulesBeforeExecution: true,
 *   enabledStages: ['PRE_DETECTION', 'POST_DETECTION'],
 *   customMetadata: { source: 'user-config' }
 * };
 *
 * const result = CapabilityValidationConfigSchema.safeParse(config);
 * if (result.success) {
 *   // Configuration is valid
 * }
 * ```
 *
 * @see {@link CapabilityValidationConfig} for the TypeScript interface
 */
export const CapabilityValidationConfigSchema = z
  .object({
    enabled: z.boolean().describe('Whether validation pipeline is enabled'),

    maxValidationTimeMs: z
      .number()
      .int()
      .min(100, 'Validation timeout must be at least 100ms for meaningful validation')
      .max(10000, 'Validation timeout cannot exceed 10 seconds to prevent blocking')
      .describe('Maximum time allowed for validation execution in milliseconds'),

    continueAfterCritical: z
      .boolean()
      .describe('Whether to continue capability detection after critical validation failures'),

    collectPerformanceMetrics: z
      .boolean()
      .describe('Whether to collect detailed performance metrics during validation'),

    memoryLimitBytes: z
      .number()
      .int()
      .min(65536, 'Memory limit must be at least 64KB for basic validation operations')
      .max(10485760, 'Memory limit cannot exceed 10MB to prevent resource exhaustion')
      .describe('Maximum memory usage allowed for validation in bytes'),

    validateRulesBeforeExecution: z
      .boolean()
      .describe('Whether to validate validation rules themselves before execution'),

    enabledStages: z
      .array(z.nativeEnum(ValidationStage))
      .max(3, 'Cannot have more than 3 validation stages')
      .describe('Validation stages that should be executed'),

    customMetadata: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Custom metadata for validation configuration'),
  })
  .strict()
  .refine(
    config => {
      // If validation is disabled, no stages should be enabled
      return config.enabled || config.enabledStages.length === 0;
    },
    {
      message: 'When validation is disabled, enabledStages must be empty',
      path: ['enabledStages'],
    },
  )
  .refine(
    config => {
      // Performance metrics collection requires reasonable memory limits
      return !config.collectPerformanceMetrics || config.memoryLimitBytes >= 131072;
    },
    {
      message: 'Performance metrics collection requires at least 128KB memory limit',
      path: ['memoryLimitBytes'],
    },
  )
  .refine(
    config => {
      // Rule validation requires reasonable time limits
      return !config.validateRulesBeforeExecution || config.maxValidationTimeMs >= 500;
    },
    {
      message: 'Rule validation requires at least 500ms timeout for proper validation',
      path: ['maxValidationTimeMs'],
    },
  )
  .describe(
    'Configuration for capability validation pipeline with bounds checking and consistency validation',
  );
