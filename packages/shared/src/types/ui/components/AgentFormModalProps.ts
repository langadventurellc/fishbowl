/**
 * Props interface for agent form modal component
 *
 * @module types/ui/components/AgentFormModalProps
 */
import type { AgentFormData } from "../../settings/AgentFormData";
import type { AgentCard, AgentTemplate } from "../../settings";

export interface AgentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "template";
  agent?: AgentCard;
  template?: AgentTemplate;
  onSave: (data: AgentFormData) => Promise<void>;
  isLoading?: boolean;
}
