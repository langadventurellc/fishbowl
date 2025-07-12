/**
 * Runtime Environment Union Type
 *
 * Union type for all runtime environment contexts.
 * Used for TypeScript type safety in platform-aware code.
 */

import { ElectronEnvironment } from './ElectronEnvironment';
import { NonElectronEnvironment } from './NonElectronEnvironment';

/**
 * Union type for runtime environment contexts
 */
export type RuntimeEnvironment = ElectronEnvironment | NonElectronEnvironment;
