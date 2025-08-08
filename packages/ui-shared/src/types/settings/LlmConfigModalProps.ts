import { LlmConfigData } from "./LlmConfigData";
import type { Provider } from "@fishbowl-ai/shared";

export interface LlmConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
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
