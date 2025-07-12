/**
 * Platform Type Guards Collection Interface
 *
 * Combines all platform-specific type guard functions into a single interface.
 * Provides comprehensive runtime type checking capabilities for all supported platforms.
 */

import { ElectronTypeGuard } from './ElectronTypeGuard';
import { CapacitorTypeGuard } from './CapacitorTypeGuard';
import { WebTypeGuard } from './WebTypeGuard';
import { PlatformTypeGuard } from './PlatformTypeGuard';

/**
 * Collection of all platform type guard functions
 */
export interface PlatformTypeGuards {
  /** Check if running in Electron environment */
  isElectron: ElectronTypeGuard;
  /** Check if running in Capacitor environment */
  isCapacitor: CapacitorTypeGuard;
  /** Check if running in web browser environment */
  isWeb: WebTypeGuard;
  /** General platform type checker */
  isPlatform: PlatformTypeGuard;
}
