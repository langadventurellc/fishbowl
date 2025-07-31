/**
 * Props interface for agent form modal component
 *
 * @module types/ui/components/AgentFormModalProps
 */
import type { AgentCard, AgentTemplate } from "../settings";
import type { AgentFormData } from "./AgentFormData";

export interface AgentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "template";
  agent?: AgentCard;
  template?: AgentTemplate;
  onSave: (data: AgentFormData) => Promise<void>;
  isLoading?: boolean;
}
