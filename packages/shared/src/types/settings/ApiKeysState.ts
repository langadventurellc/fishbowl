/**
 * Enhanced API Keys state interface with validation support
 *
 * @module types/settings/ApiKeysState
 */

import type { ProviderState } from "./providers";

export interface ApiKeysState {
  [providerId: string]: ProviderState & {
    errors?: { apiKey?: string; baseUrl?: string };
    isValidating?: boolean;
  };
}
