import { getProviderConfig } from "./getProviderConfig";
import type { ProviderState } from "./providerState";
import type { ProviderId } from "./providerId";

/**
 * Creates initial provider state with default values.
 *
 * @param providerId - The provider identifier
 * @returns Initial provider state object
 */
export function createInitialProviderState(providerId: string): ProviderState {
  const provider = getProviderConfig(providerId);

  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  return {
    apiKey: "",
    baseUrl: provider.defaultBaseUrl,
    providerId: provider.id as ProviderId,
    status: "untested",
    showApiKey: false,
    showAdvanced: false,
  };
}
