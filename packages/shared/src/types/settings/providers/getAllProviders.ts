import { PROVIDERS } from "./providersConfig";
import type { ProviderConfig } from "./providerConfig";

/**
 * Gets all available provider configurations as an array.
 *
 * @returns Array of all provider configurations
 */
export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS);
}
