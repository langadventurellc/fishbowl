import type { SettingsPersistenceAdapter } from "./SettingsPersistenceAdapter";
import type { SettingsPersistenceConfig } from "./SettingsPersistenceConfig";

/**
 * Factory function type for creating platform-specific persistence adapters.
 * Implementations should accept optional configuration and return a configured adapter.
 *
 * @example
 * ```typescript
 * const createDesktopAdapter: CreateSettingsPersistenceAdapter = (config) => {
 *   return new DesktopSettingsAdapter(config);
 * };
 *
 * const adapter = createDesktopAdapter({ debug: true });
 * ```
 */
export type CreateSettingsPersistenceAdapter = (
  config?: SettingsPersistenceConfig,
) => SettingsPersistenceAdapter;
