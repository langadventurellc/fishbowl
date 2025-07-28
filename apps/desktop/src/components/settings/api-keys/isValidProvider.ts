import { PROVIDERS } from "./providersConfig";
import type { ProviderId } from "./providerId";

/**
 * Checks if a provider ID is valid and supported.
 *
 * @param providerId - The provider identifier to check
 * @returns True if provider is supported
 */
export function isValidProvider(providerId: string): providerId is ProviderId {
  return providerId in PROVIDERS;
}
