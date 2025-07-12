/**
 * Platform Information Interface
 *
 * Defines the structure for comprehensive platform information including
 * platform type, individual detection results, and environment details.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Platform information interface
 */
export interface PlatformInfo {
  /** Current platform type */
  platformType: PlatformType;
  /** Individual detection results */
  detections: {
    isElectron: boolean;
    isCapacitor: boolean;
    isWeb: boolean;
  };
  /** Environment details */
  environment: {
    hasWindow: boolean;
    hasElectronAPI: boolean;
    hasCapacitorAPI: boolean;
    hasNavigator: boolean;
  };
  /** Detection timestamp */
  timestamp: number;
}
