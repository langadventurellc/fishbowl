/**
 * Known Platform Type Definition
 *
 * Type representing known platform types (excluding UNKNOWN).
 * Used for TypeScript type narrowing to exclude unsupported platforms.
 */

import { PlatformType } from '../../constants/platform/PlatformType';

/**
 * Type representing known platform types (excluding UNKNOWN)
 */
export type KnownPlatformType = Exclude<PlatformType, PlatformType.UNKNOWN>;
