/**
 * Configuration for mock validation service
 */

export interface ValidationServiceMockConfig {
  shouldFail?: boolean;
  allowInvalidRanges?: boolean;
  allowMissingTraits?: boolean;
  statisticalThreshold?: number;
}
