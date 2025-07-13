import { CapabilityCategory } from '../../../constants/platform/CapabilityCategory';
import { DetectionStatus } from '../../../constants/platform/DetectionStatus';

/**
 * Utility type for services that change their interface based on capability availability.
 * Methods and properties are conditionally available based on capability detection.
 *
 * @template T - The base service interface
 * @template Capabilities - Object mapping capability categories to their required statuses
 *
 * @example
 * ```typescript
 * interface BaseFileService {
 *   listFiles: () => Promise<string[]>;
 *   readTextFile?: (path: string) => Promise<string>;
 *   writeTextFile?: (path: string, content: string) => Promise<void>;
 *   openFileDialog?: () => Promise<string | null>;
 * }
 *
 * type FileService = CapabilityAwareService<BaseFileService, {
 *   [CapabilityCategory.FILESYSTEM]: DetectionStatus.AVAILABLE;
 *   [CapabilityCategory.UI]: DetectionStatus.AVAILABLE;
 * }>;
 *
 * // Service methods are only available when capabilities are detected
 * ```
 */
export type CapabilityAwareService<
  T,
  Capabilities extends Partial<Record<CapabilityCategory, DetectionStatus>>,
> = T & {
  readonly _requiredCapabilities: Capabilities;
  readonly _capabilityStatus: {
    [K in keyof Capabilities]: Capabilities[K];
  };
};
