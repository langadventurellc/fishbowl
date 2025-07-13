/**
 * All Platform Environment Union Type
 *
 * Comprehensive union type for all possible runtime environment contexts.
 * Used for TypeScript type safety in platform-aware code with complete coverage.
 */

import { ElectronEnvironment } from './ElectronEnvironment';
import { CapacitorEnvironment } from './CapacitorEnvironment';
import { WebEnvironment } from './WebEnvironment';
import { UnknownEnvironment } from './UnknownEnvironment';

/**
 * Union type for all runtime environment contexts
 */
export type AllPlatformEnvironment =
  | ElectronEnvironment
  | CapacitorEnvironment
  | WebEnvironment
  | UnknownEnvironment;
