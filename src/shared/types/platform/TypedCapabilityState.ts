/**
 * Typed Capability State Interface
 *
 * Platform capability state with type-safe status.
 */

import { CapabilityCategory } from '../../constants/platform/CapabilityCategory';
import { DetectionStatus } from '../../constants/platform/DetectionStatus';
import { PlatformCapabilityId } from './PlatformCapabilityId';
import { TypedDetectionResult } from './TypedDetectionResult';

/**
 * Platform capability state with type-safe status
 */
export interface TypedCapabilityState<T extends DetectionStatus = DetectionStatus> {
  /** Capability identifier */
  id: PlatformCapabilityId;
  /** Category of the capability */
  category: CapabilityCategory;
  /** Detection result based on status */
  result: TypedDetectionResult<T>;
  /** When this state was last updated */
  lastUpdated: number;
  /** Cache expiration time */
  expiresAt: number;
}
