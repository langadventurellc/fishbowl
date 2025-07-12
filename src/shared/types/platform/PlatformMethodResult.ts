/**
 * Platform Detection Method Result Interface
 *
 * Standardizes the result structure for individual platform detection methods
 * (Electron, Capacitor, Web detection functions).
 */

/**
 * Result from an individual platform detection method
 */
export interface PlatformMethodResult {
  /** Whether this platform was detected */
  detected: boolean;
  /** Confidence score for this detection (0-100) */
  confidence: number;
  /** Evidence that led to this detection result */
  evidence: string[];
  /** Any warnings or concerns about the detection */
  warnings?: string[];
  /** Performance metrics for this detection */
  performanceMs: number;
}
