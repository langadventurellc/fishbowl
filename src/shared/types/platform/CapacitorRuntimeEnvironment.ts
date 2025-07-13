/**
 * Capacitor Runtime Environment Union Type
 *
 * Union type for Capacitor-aware runtime environment contexts.
 * Used for TypeScript type safety in Capacitor platform detection.
 */

import { CapacitorEnvironment } from './CapacitorEnvironment';
import { NonCapacitorEnvironment } from './NonCapacitorEnvironment';

/**
 * Union type for Capacitor-aware runtime environment contexts
 */
export type CapacitorRuntimeEnvironment = CapacitorEnvironment | NonCapacitorEnvironment;
