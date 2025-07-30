/**
 * Provider configuration interface defining structure and validation rules
 * for API providers in the settings system.
 */
export interface ProviderConfig {
  id: string;
  name: string;
  defaultBaseUrl: string;
  apiKeyValidation: {
    minLength: number;
    pattern?: RegExp;
    placeholder: string;
  };
}
