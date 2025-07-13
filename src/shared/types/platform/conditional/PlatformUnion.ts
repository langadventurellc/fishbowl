import { PlatformType } from '../../../constants/platform/PlatformType';

/**
 * Utility type that creates union types across multiple platforms.
 * Each platform variant includes the platform type for discrimination.
 *
 * @template T - Object mapping platform types to their specific type variants
 *
 * @example
 * ```typescript
 * type StorageService = PlatformUnion<{
 *   [PlatformType.ELECTRON]: {
 *     type: 'file-system';
 *     path: string;
 *     writeFile: (data: string) => Promise<void>;
 *   };
 *   [PlatformType.WEB]: {
 *     type: 'local-storage';
 *     key: string;
 *     setItem: (value: string) => void;
 *   };
 *   [PlatformType.CAPACITOR]: {
 *     type: 'native-storage';
 *     plugin: string;
 *     store: (data: any) => Promise<void>;
 *   };
 * }>;
 *
 * // Result: Union of all platform-specific storage services
 * ```
 */
export type PlatformUnion<T extends Partial<Record<PlatformType, unknown>>> = {
  [K in keyof T]: T[K] & {
    readonly platform: K;
  };
}[keyof T];
