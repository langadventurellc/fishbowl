/**
 * Props for provider card component
 *
 * @module types/ui/components/ProviderCardProps
 */

export interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    defaultBaseUrl: string;
  };
  apiKey: string;
  baseUrl: string;
  status: "connected" | "error" | "untested";
  showApiKey: boolean;
  showAdvanced: boolean;
  onApiKeyChange: (value: string) => void;
  onBaseUrlChange: (value: string) => void;
  onToggleApiKey: () => void;
  onToggleAdvanced: () => void;
  onTest: () => void;
  errors?: {
    apiKey?: string;
    baseUrl?: string;
  };
  isValidating?: boolean;
}
