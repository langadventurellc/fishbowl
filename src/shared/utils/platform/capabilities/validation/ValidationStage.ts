/**
 * Enumeration of capability validation stages
 *
 * The validation pipeline runs in three distinct stages:
 * - PRE_DETECTION: Validates capability definition and detector configuration before detection begins
 * - DURING_DETECTION: Validates detection process and intermediate results during execution
 * - POST_DETECTION: Validates final detection results and applies consistency checks
 */
export enum ValidationStage {
  /**
   * Pre-detection validation stage
   * Runs before capability detection begins
   * Validates capability definition, detector configuration, and prerequisites
   */
  PRE_DETECTION = 'PRE_DETECTION',

  /**
   * During-detection validation stage
   * Runs during the capability detection process
   * Validates intermediate results, detection progress, and runtime conditions
   */
  DURING_DETECTION = 'DURING_DETECTION',

  /**
   * Post-detection validation stage
   * Runs after capability detection completes
   * Validates final results, consistency checks, and result integrity
   */
  POST_DETECTION = 'POST_DETECTION',
}
