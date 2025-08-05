import type { LlmProviderInstance } from "./LlmProviderInstance";
import type { LegacyLlmConfigData } from "./LegacyLlmConfigData";

/**
 * Converts a provider instance to the legacy LlmConfigData format.
 *
 * @param instance - The provider instance to convert
 * @returns Legacy format configuration data
 *
 * @example
 * ```typescript
 * const legacyData = toLegacyFormat(providerInstance);
 * ```
 */
export const toLegacyFormat = (
  instance: LlmProviderInstance,
): LegacyLlmConfigData => {
  return {
    customName: instance.displayName || "",
    apiKey: (instance.values.apiKey as string) || "",
    baseUrl: (instance.values.baseUrl as string) || "",
    useAuthHeader: (instance.values.useAuthHeader as boolean) || false,
  };
};
