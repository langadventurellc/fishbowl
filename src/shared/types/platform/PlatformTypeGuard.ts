/**
 * Platform Type Guard Function Signature Interface
 *
 * Defines the standard signature for platform detection type guard functions.
 * Ensures consistent runtime type checking across the platform detection system.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Type guard function signature for platform type checking
 */
export interface PlatformTypeGuard {
  /**
   * Checks if the current environment matches a specific platform type
   * @param platformType - Platform type to check against
   * @returns True if environment matches the platform type
   */
  (platformType: PlatformType): platformType is PlatformType;
}
