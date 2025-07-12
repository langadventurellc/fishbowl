/**
 * Category Capability ID Type
 *
 * Type-safe capability identifier for a specific category.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';
import { CapabilityCategoryMap } from './CapabilityCategoryMap';

/**
 * Type-safe capability identifier for a specific category
 */
export type CategoryCapabilityId<T extends CapabilityCategory> = `${T}.${CapabilityCategoryMap[T]}`;
