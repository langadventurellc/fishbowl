import type { Provider } from "./Provider";

export interface StoredLlmConfig {
  id: string;
  customName: string;
  provider: Provider;
  baseUrl?: string;
  useAuthHeader: boolean;
}
