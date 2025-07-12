/**
 * Use Platform Hook State Interface
 *
 * Defines the state properties for the usePlatform React hook.
 * Follows the established hook state pattern used throughout the application.
 */

import { PlatformType } from '../../constants/platform/PlatformType';
import { OperatingSystem } from '../../constants/platform/OperatingSystem';
import { RuntimeEnvironment } from '../../constants/platform/RuntimeEnvironment';
import { PlatformInfo } from '../../utils/platform/PlatformInfo';

/**
 * State properties for the usePlatform hook
 */
export interface UsePlatformState {
  /** Current platform information */
  platformInfo: PlatformInfo | null;
  /** Current platform type */
  platformType: PlatformType;
  /** Detected operating system */
  operatingSystem: OperatingSystem;
  /** Runtime environment */
  runtimeEnvironment: RuntimeEnvironment;
  /** Whether platform detection is in progress */
  loading: boolean;
  /** Error message if platform detection failed */
  error: string | null;
  /** Whether platform detection has been initialized */
  initialized: boolean;
  /** Timestamp of last successful detection */
  lastDetectionTime: number | null;
}
