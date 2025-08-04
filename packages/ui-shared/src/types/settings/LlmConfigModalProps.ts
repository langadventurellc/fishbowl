import { LlmConfigData } from "./LlmConfigData";

export interface LlmConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "openai" | "anthropic";
  mode?: "add" | "edit";
  initialData?: {
    id?: string;
    customName?: string;
    apiKey?: string;
    baseUrl?: string;
    useAuthHeader?: boolean;
  };
  onSave: (data: LlmConfigData & { id?: string }) => void;
}
