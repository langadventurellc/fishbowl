/**
 * Props interface for agent form modal component
 *
 * @module types/ui/components/AgentFormModalProps
 */
import { AgentCard } from "./AgentCard";
import type { AgentFormData } from "./AgentFormData";
import { AgentTemplate } from "./AgentTemplate";

export interface AgentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit" | "template";
  agent?: AgentCard;
  template?: AgentTemplate;
  onSave: (data: AgentFormData) => Promise<void>;
  isLoading?: boolean;
}
