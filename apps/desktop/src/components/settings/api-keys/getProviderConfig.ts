import { PROVIDERS } from "./providersConfig";
import type { ProviderConfig } from "./providerConfig";
import type { ProviderId } from "./providerId";

/**
 * Retrieves provider configuration by ID with type safety.
 *
 * @param providerId - The provider identifier
 * @returns Provider configuration or undefined if not found
 */
export function getProviderConfig(
  providerId: string,
): ProviderConfig | undefined {
  return PROVIDERS[providerId as ProviderId];
}
