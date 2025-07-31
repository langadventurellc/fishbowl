/**
 * Props interface for agent form component
 *
 * @module types/ui/components/AgentFormProps
 */
import { AgentCard } from "./AgentCard";
import type { AgentFormData } from "./AgentFormData";
import { AgentTemplate } from "./AgentTemplate";

export interface AgentFormProps {
  mode: "create" | "edit" | "template";
  initialData?: Partial<AgentFormData>;
  templateData?: AgentTemplate;
  onSave: (data: AgentFormData) => void;
  onCancel: () => void;
  existingAgents?: AgentCard[];
  isLoading?: boolean;
}
