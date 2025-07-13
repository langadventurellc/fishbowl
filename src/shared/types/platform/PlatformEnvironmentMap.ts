/**
 * Platform Environment Mapping Type
 *
 * Type mapping PlatformType enum values to their corresponding environment interfaces.
 * Used for TypeScript type narrowing in platform-specific type guards.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { ElectronEnvironment } from './ElectronEnvironment';
import { CapacitorEnvironment } from './CapacitorEnvironment';
import { WebEnvironment } from './WebEnvironment';
import { UnknownEnvironment } from './UnknownEnvironment';

/**
 * Type mapping PlatformType enum values to their environment interfaces
 */
export interface PlatformEnvironmentMap {
  [PlatformType.ELECTRON]: ElectronEnvironment;
  [PlatformType.CAPACITOR]: CapacitorEnvironment;
  [PlatformType.WEB]: WebEnvironment;
  [PlatformType.UNKNOWN]: UnknownEnvironment;
}
