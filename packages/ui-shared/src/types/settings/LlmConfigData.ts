import type { Provider } from "@fishbowl-ai/shared";

export interface LlmConfigData {
  customName: string;
  provider: Provider;
  apiKey: string;
  baseUrl?: string;
  useAuthHeader: boolean;
}
