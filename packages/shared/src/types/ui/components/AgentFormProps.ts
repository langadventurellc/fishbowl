/**
 * Props interface for agent form component
 *
 * @module types/ui/components/AgentFormProps
 */
import type { AgentFormData } from "../../settings/AgentFormData";
import type { AgentCard, AgentTemplate } from "../../settings";

export interface AgentFormProps {
  mode: "create" | "edit" | "template";
  initialData?: Partial<AgentFormData>;
  templateData?: AgentTemplate;
  onSave: (data: AgentFormData) => void;
  onCancel: () => void;
  existingAgents?: AgentCard[];
  isLoading?: boolean;
}
