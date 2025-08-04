import { LlmConfigData } from "./LlmConfigData";

export interface LlmConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "openai" | "anthropic";
  initialData?: {
    customName?: string;
    apiKey?: string;
    baseUrl?: string;
    useAuthHeader?: boolean;
  };
  onSave: (data: LlmConfigData) => void;
}
