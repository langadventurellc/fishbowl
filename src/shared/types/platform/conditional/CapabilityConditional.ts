import { CapabilityCategory } from '../../../constants/platform/CapabilityCategory';
import { DetectionStatus } from '../../../constants/platform/DetectionStatus';

/**
 * Utility type that conditionally includes properties based on capability availability.
 * Properties are only available when the capability status indicates availability.
 *
 * @template T - The base type containing properties
 * @template C - The capability category that must be available
 * @template S - The detection status required (defaults to AVAILABLE)
 *
 * @example
 * ```typescript
 * interface ServiceInterface {
 *   basicFeature: string;
 *   fileSystemFeature: CapabilityConditional<{
 *     readFile: (path: string) => Promise<string>;
 *     writeFile: (path: string, data: string) => Promise<void>;
 *   }, CapabilityCategory.FILESYSTEM>;
 * }
 *
 * // If filesystem capability is available: includes file operations
 * // If filesystem capability is unavailable: fileSystemFeature is never
 * ```
 */
export type CapabilityConditional<
  T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  C extends CapabilityCategory,
  S extends DetectionStatus = DetectionStatus.AVAILABLE,
> = S extends DetectionStatus.AVAILABLE ? T : never;
