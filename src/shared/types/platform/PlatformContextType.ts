/**
 * Platform Context Type Definition
 *
 * Type representing a valid platform context object.
 * Used for validating and narrowing platform detection results.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Type representing a valid platform context object
 */
export interface PlatformContextType {
  readonly platformType: PlatformType;
  readonly detections: {
    readonly isElectron: boolean;
    readonly isCapacitor: boolean;
    readonly isWeb: boolean;
  };
  readonly environment: {
    readonly hasWindow: boolean;
    readonly hasElectronAPI: boolean;
    readonly hasCapacitorAPI: boolean;
    readonly hasNavigator: boolean;
  };
  readonly timestamp: number;
}
