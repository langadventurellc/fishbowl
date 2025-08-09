import type { Provider, LlmConfigInput } from "@fishbowl-ai/shared";

export interface LlmConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: Provider;
  mode?: "add" | "edit";
  initialData?: Partial<LlmConfigInput> & { id?: string };
  onSave: (data: LlmConfigInput & { id?: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  existingConfigs?: Array<{ id: string; customName: string }>;
}
