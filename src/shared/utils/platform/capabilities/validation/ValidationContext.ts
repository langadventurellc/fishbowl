import { CapabilityDetectionResult, PlatformCapability } from '../../../../types/platform';
import type { ValidationStage } from './ValidationStage';

/**
 * Context passed to validation rules during execution
 */
export interface ValidationContext {
  /** The capability being validated */
  capability: PlatformCapability;
  /** Current validation stage */
  stage: ValidationStage;
  /** Detection result (available in POST_DETECTION stage) */
  detectionResult?: CapabilityDetectionResult;
  /** Intermediate data from detection process */
  intermediateData?: Record<string, unknown>;
  /** Timestamp when validation started */
  startTime: number;
  /** Platform type being detected on */
  platformType?: string;
  /** Additional context metadata */
  metadata?: Record<string, unknown>;
}
