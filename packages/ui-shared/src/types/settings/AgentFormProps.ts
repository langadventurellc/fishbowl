/**
 * Props interface for agent form component
 *
 * @module types/ui/components/AgentFormProps
 */
import type { AgentCard, AgentTemplate } from "../settings";
import type { AgentFormData } from "./AgentFormData";

export interface AgentFormProps {
  mode: "create" | "edit" | "template";
  initialData?: Partial<AgentFormData>;
  templateData?: AgentTemplate;
  onSave: (data: AgentFormData) => void;
  onCancel: () => void;
  existingAgents?: AgentCard[];
  isLoading?: boolean;
}
