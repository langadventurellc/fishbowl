import type { ProviderFormData } from "./providerFormData";

/**
 * Provider state interface for component state management.
 * Extends form data with UI-specific state properties.
 */
export interface ProviderState extends ProviderFormData {
  status: "connected" | "error" | "untested";
  showApiKey: boolean;
  showAdvanced: boolean;
}
