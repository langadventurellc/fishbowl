import type { Provider } from "./Provider";

export interface MockLlmConfig {
  customName: string;
  provider: Provider;
  apiKey: string;
  baseUrl?: string;
  useAuthHeader: boolean;
}
