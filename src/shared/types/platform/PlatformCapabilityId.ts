/**
 * Platform Capability Identifier Type
 *
 * Type-safe identifier for platform capabilities combining category and name.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';

/**
 * Platform capability identifier combining category and name
 */
export type PlatformCapabilityId = `${CapabilityCategory}.${string}`;
